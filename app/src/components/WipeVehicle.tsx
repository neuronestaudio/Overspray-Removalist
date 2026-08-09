import { useEffect, useRef, useState } from 'react';

/**
 * 3D wipe: a Hilux turning on its axis under a coat of fallout, cleaned off by
 * pointer or finger.
 *
 * How the dirt works, and why it works this way:
 *
 * The model has no UVs at all (68 separate parts, 9 materials, no texture
 * atlas), so the usual trick of painting into UV space is not available. Nor
 * would screen space work: the vehicle rotates, and screen-space dirt would
 * slide across it like a smear on the lens.
 *
 * So cleanliness is indexed by DIRECTION in object space. Every fragment takes
 * the direction from the model's centre out to itself, converts it to
 * longitude/latitude, and samples one equirectangular mask. Wiping raycasts the
 * pointer onto the mesh, converts the hit point to the same longitude/latitude,
 * and paints a soft hole in the mask. For a convex-ish vehicle exterior that
 * mapping is near enough bijective, it needs no UVs, it costs one texture, and
 * it rotates with the body because the whole thing lives in object space.
 *
 * Everything is loaded lazily: three.js and the 1.8 MB model are only fetched
 * once the panel is near the viewport, and the caller keeps a 2D photo wipe as
 * the fallback for reduced motion, absent WebGL, or a load that never arrives.
 */

const MASK_W = 1024;
const MASK_H = 512;
/** Brush radius in mask pixels. Generous: fingers are not precise. */
const BRUSH = 74;
const GRID_X = 48;
const GRID_Y = 24;
const CLEAN_TARGET = 0.8;

/* OFF while the framing is unfinished.
 *
 * Where it got to: the model loads (1.8 MB, meshopt), the scene runs, the
 * shader compiles, the wipe mask and raycast painting are wired, and the
 * measurements are all correct: the Box3 reads 2.03 x 1.68 x 5.23 m, which is a
 * real Hilux, and after scaling the group's final box is 3.4 units centred on
 * the origin. Despite that it draws as a sliver a few pixels wide, so something
 * between the camera and the draw call disagrees with those numbers. Not frustum
 * culling: recomputing bounding volumes and disabling culling changed nothing.
 *
 * The 2D photo wipe is the real, working demonstration, so this stays off rather
 * than shipping an empty panel. Flip to true to pick it back up. */
const ENABLE_3D = false;

interface Props {
  /** Fires once the body is CLEAN_TARGET clean. */
  onClean?: () => void;
  /** Told when the scene is live, so the caller can drop its fallback. */
  onReady?: (ok: boolean) => void;
}

export default function WipeVehicle({ onClean, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [cleaned, setCleaned] = useState(false);
  const [touched, setTouched] = useState(false);
  const apiRef = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!ENABLE_3D || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStatus('failed');
      onReady?.(false);
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    /* Only pay for three.js and the model when the panel is actually coming
       into view. On a lead-gen page most visitors never scroll this far. */
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setStatus('loading');
        boot(host).then((c) => {
          if (disposed) c?.();
          else cleanup = c;
        });
      },
      { rootMargin: '400px' },
    );
    io.observe(host);

    /* The host is passed in rather than closed over. `boot` is a hoisted
       function declaration, so TypeScript will not carry the enclosing
       null-guard into its body: it cannot prove the guard ran first. A
       parameter makes the non-null contract explicit instead of asserted. */
    async function boot(el: HTMLDivElement): Promise<(() => void) | undefined> {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        fail();
        return;
      }

      const canvas = document.createElement('canvas');
      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        fail();
        return;
      }

      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');

      if (disposed) return;

      el.appendChild(canvas);
      canvas.className = 'wv-canvas';

      /* Cap the pixel ratio hard. A phone at DPR 3 renders nine times the
         fragments of DPR 1 for a model nobody is inspecting at pixel level. */
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

      // ---- lighting: a dark studio, warm key, cool rim
      scene.add(new THREE.HemisphereLight(0x9fb4d8, 0x0a0d16, 0.55));
      const key = new THREE.DirectionalLight(0xfff0e2, 2.6);
      key.position.set(4, 6, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xff7a2f, 1.5);
      rim.position.set(-5, 3, -4);
      scene.add(rim);
      const fill = new THREE.DirectionalLight(0x6f8fd0, 0.8);
      fill.position.set(-3, 2, 5);
      scene.add(fill);

      // ---- the dirt mask: 1 = filthy, 0 = clean
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = MASK_W;
      maskCanvas.height = MASK_H;
      const mctx = maskCanvas.getContext('2d', { willReadFrequently: false })!;
      const maskTex = new THREE.CanvasTexture(maskCanvas);
      maskTex.wrapS = THREE.RepeatWrapping;
      maskTex.wrapT = THREE.ClampToEdgeWrapping;
      maskTex.colorSpace = THREE.NoColorSpace;

      const cells = new Uint8Array(GRID_X * GRID_Y);
      function fillMask() {
        mctx.globalCompositeOperation = 'source-over';
        mctx.fillStyle = '#fff';
        mctx.fillRect(0, 0, MASK_W, MASK_H);
        cells.fill(0);
        maskTex.needsUpdate = true;
      }
      fillMask();

      const group = new THREE.Group();
      scene.add(group);

      let model: import('three').Object3D | null = null;
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

      try {
        const gltf = await loader.loadAsync('/assets/models/hilux.glb');
        model = gltf.scene;
      } catch {
        fail();
        return;
      }
      if (disposed || !model) return;

      // ---- frame it: centre on origin, scale to fit
      /* Matrices first. quantize() pushes a compensating scale onto each node,
         so a Box3 taken before the world matrices are current measures the raw
         quantized range and the model ends up microscopic. */
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const scale = 3.4 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      model.position.set(-centre.x * scale, -centre.y * scale, -centre.z * scale);
      group.add(model);
      group.updateMatrixWorld(true);

      /* Radius used to normalise direction, in the group's local space, which is
         where both the shader and the raycaster do their work. */
      const radius = Math.max(size.x, size.y, size.z) * scale * 0.5;

      /* Inverse of the group's world matrix, refreshed every frame. The shader
         needs each fragment in GROUP space, and it cannot get there from
         `position`: this model is 68 separate nodes, so `position` is per-part
         local space and every part would index the mask differently. World
         position through this inverse is the only shared frame they have. */
      const groupInv = new THREE.Matrix4();

      // ---- inject the dirt into every material the model brought with it
      const shaders: { uniforms: Record<string, { value: unknown }> }[] = [];
      const meshes: import('three').Mesh[] = [];
      model.traverse((o) => {
        const mesh = o as import('three').Mesh;
        if (!mesh.isMesh) return;
        /* Bounding volumes are stale after re-quantising and re-scaling, and a
           wrong bounding sphere gets the whole part culled from the frustum
           while Box3 still measures it correctly. Recompute, and stop culling
           parts of a single centred model anyway. */
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
        mesh.frustumCulled = false;
        meshes.push(mesh);
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          const m = mat as import('three').MeshStandardMaterial;
          m.onBeforeCompile = (shader) => {
            shader.uniforms.uMask = { value: maskTex };
            shader.uniforms.uRadius = { value: radius };
            shader.uniforms.uGroupInv = { value: groupInv };
            shaders.push(shader as unknown as { uniforms: Record<string, { value: unknown }> });
            shader.vertexShader =
              'varying vec3 vWorldPos;\n' +
              shader.vertexShader.replace(
                '#include <project_vertex>',
                '#include <project_vertex>\n  vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
              );
            shader.fragmentShader =
              'uniform sampler2D uMask;\nuniform float uRadius;\nuniform mat4 uGroupInv;\nvarying vec3 vWorldPos;\n' +
              /* cheap value noise, so the grime has grain rather than reading
                 like a flat wash of brown */
              'float osrHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n' +
              'float osrNoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);\n' +
              '  return mix(mix(osrHash(i), osrHash(i+vec2(1,0)), f.x), mix(osrHash(i+vec2(0,1)), osrHash(i+vec2(1,1)), f.x), f.y); }\n' +
              shader.fragmentShader.replace(
                '#include <color_fragment>',
                `#include <color_fragment>
  {
    vec3 lp = (uGroupInv * vec4(vWorldPos, 1.0)).xyz;
    vec3 d = normalize(lp / max(uRadius, 0.0001));
    // equirectangular: longitude around Y, latitude from Y
    vec2 muv = vec2(atan(d.z, d.x) / 6.2831853 + 0.5, acos(clamp(d.y, -1.0, 1.0)) / 3.1415926);
    float dirt = texture2D(uMask, muv).r;
    float grain = osrNoise(lp.xz * 26.0) * 0.5 + osrNoise(lp.xy * 41.0) * 0.5;
    // more of it settles on upward faces, the way fallout actually lands
    float up = clamp(d.y * 0.5 + 0.62, 0.0, 1.0);
    float amt = clamp(dirt * (0.45 + grain * 0.75) * up, 0.0, 1.0);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.30, 0.25, 0.20), amt * 0.92);
  }`,
              );
          };
          m.needsUpdate = true;
        }
      });


      // ---- camera
      camera.position.set(0, 1.15, 7.4);
      camera.lookAt(0, 0.05, 0);

      // ---- painting
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const local = new THREE.Vector3();

      function paintAt(clientX: number, clientY: number): boolean {
        const rect = canvas.getBoundingClientRect();
        ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        if (!hits.length) return false;

        // world hit -> the group's local space, which is where the shader looks
        local.copy(hits[0].point);
        group.worldToLocal(local);
        local.divideScalar(Math.max(radius, 0.0001)).normalize();

        const u = Math.atan2(local.z, local.x) / (Math.PI * 2) + 0.5;
        const v = Math.acos(Math.max(-1, Math.min(1, local.y))) / Math.PI;
        const px = u * MASK_W;
        const py = v * MASK_H;

        mctx.globalCompositeOperation = 'destination-out';
        const g = mctx.createRadialGradient(px, py, 0, px, py, BRUSH);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(0.62, 'rgba(0,0,0,0.85)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        mctx.beginPath();
        mctx.arc(px, py, BRUSH, 0, Math.PI * 2);
        mctx.fill();
        // longitude wraps, so paint the seam twice or a stripe never cleans
        if (px < BRUSH || px > MASK_W - BRUSH) {
          const wrapX = px < BRUSH ? px + MASK_W : px - MASK_W;
          const g2 = mctx.createRadialGradient(wrapX, py, 0, wrapX, py, BRUSH);
          g2.addColorStop(0, 'rgba(0,0,0,1)');
          g2.addColorStop(0.62, 'rgba(0,0,0,0.85)');
          g2.addColorStop(1, 'rgba(0,0,0,0)');
          mctx.fillStyle = g2;
          mctx.beginPath();
          mctx.arc(wrapX, py, BRUSH, 0, Math.PI * 2);
          mctx.fill();
        }
        maskTex.needsUpdate = true;

        // coverage, on a coarse grid rather than reading the canvas back
        const cx = Math.floor(u * GRID_X);
        const cy = Math.floor(v * GRID_Y);
        const sx = Math.max(1, Math.round((BRUSH / MASK_W) * GRID_X));
        const sy = Math.max(1, Math.round((BRUSH / MASK_H) * GRID_Y));
        for (let j = cy - sy; j <= cy + sy; j++) {
          for (let i = cx - sx; i <= cx + sx; i++) {
            if (j < 0 || j >= GRID_Y) continue;
            cells[((i % GRID_X) + GRID_X) % GRID_X + j * GRID_X] = 1;
          }
        }
        return true;
      }

      let reached = false;
      function checkClean() {
        if (reached) return;
        let hit = 0;
        for (let i = 0; i < cells.length; i++) hit += cells[i];
        if (hit / cells.length >= CLEAN_TARGET) {
          reached = true;
          setCleaned(true);
          onClean?.();
        }
      }

      // ---- input
      let dragging = false;
      let spin = true;
      let resumeAt = 0;

      const onDown = (e: PointerEvent) => {
        dragging = true;
        setTouched(true);
        spin = false;
        canvas.setPointerCapture?.(e.pointerId);
        if (paintAt(e.clientX, e.clientY)) checkClean();
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && !dragging) {
          // hovering also wipes, so a mouse user discovers it without clicking
          if (paintAt(e.clientX, e.clientY)) {
            setTouched(true);
            spin = false;
            resumeAt = performance.now() + 1400;
            checkClean();
          }
          return;
        }
        if (!dragging) return;
        if (paintAt(e.clientX, e.clientY)) checkClean();
      };
      const onUp = () => {
        dragging = false;
        resumeAt = performance.now() + 1400;
      };

      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', onUp);

      apiRef.current = {
        reset: () => {
          fillMask();
          reached = false;
          setCleaned(false);
        },
      };

      // ---- size + loop
      function resize() {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let raf = 0;
      let visible = true;
      const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting), { threshold: 0.05 });
      vis.observe(el);

      let last = performance.now();
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        // never burn a phone's battery on an off-screen or backgrounded canvas
        if (!visible || document.hidden) return;
        if (!spin && !dragging && now > resumeAt) spin = true;
        if (spin) group.rotation.y += dt * 0.35;
        group.updateMatrixWorld(true);
        groupInv.copy(group.matrixWorld).invert();
        for (const sh of shaders) sh.uniforms.uGroupInv.value = groupInv;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      setStatus('ready');
      onReady?.(true);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        vis.disconnect();
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('pointerleave', onUp);
        maskTex.dispose();
        renderer.dispose();
        scene.traverse((o) => {
          const mesh = o as import('three').Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m?.dispose());
        });
        canvas.remove();
      };
    }

    function fail() {
      if (disposed) return;
      setStatus('failed');
      onReady?.(false);
    }

    return () => {
      disposed = true;
      io.disconnect();
      cleanup?.();
    };
  }, [onClean, onReady]);

  if (status === 'failed') return null;

  return (
    <div className="wv" ref={hostRef} data-status={status}>
      {status !== 'ready' && (
        <p className="wv-loading" aria-live="polite">
          Loading the vehicle…
        </p>
      )}

      {status === 'ready' && !touched && (
        <div className="wv-hint" aria-hidden="true">
          <span className="wv-hint-dot" />
          Drag to clean it off
        </div>
      )}

      <button
        className="scrub-reset"
        type="button"
        onClick={() => apiRef.current?.reset()}
        data-show={cleaned ? 'true' : 'false'}
        aria-hidden={cleaned ? 'false' : 'true'}
        tabIndex={cleaned ? 0 : -1}
        title="Put the fallout back"
      >
        <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M228,128a100,100,0,0,1-98.66,100H128a99.39,99.39,0,0,1-68.62-27.29,12,12,0,0,1,16.48-17.45,76,76,0,1,0-1.57-109c-.13.13-.25.25-.39.37L54.89,92H72a12,12,0,0,1,0,24H24a12,12,0,0,1-12-12V56a12,12,0,0,1,24,0V76.72L57.48,57.06A100,100,0,0,1,228,128Z" />
        </svg>
        <span className="sr-only">Put the fallout back</span>
      </button>
    </div>
  );
}
