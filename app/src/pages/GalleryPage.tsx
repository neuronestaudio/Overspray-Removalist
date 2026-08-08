import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import Img from '../components/Img';
import { GALLERY } from '../data/gallery';
import { BUSINESS } from '../lib/site';

export default function GalleryPage() {
  return (
    <>
      <PageMeta
        title={`Gallery | Before & After Overspray Removal | ${BUSINESS.name}`}
        description="Before and after photographs of real overspray, cement splatter, graffiti and industrial fallout jobs on vehicles restored without respraying."
        path="/gallery"
        ogImage="job-tarago-before"
        ogAlt="Toyota van covered in paint overspray before restoration"
      />

      <section className="pbanner">
        <div className="shell">
          <p className="crumb">
            <Link to="/">Home</Link> / <span>Gallery</span>
          </p>
          <h1 className="display">Gallery</h1>
          <p className="lede">
            Real jobs, photographed on the day. Where a before and an after appear together, it is
            the same vehicle in both frames.
          </p>
        </div>
      </section>

      <section>
        <div className="shell">
          <div className="gal">
            {GALLERY.map((g) => (
              <figure key={g.stem}>
                <Img stem={g.stem} alt={g.alt} sizes="(max-width:620px) 100vw, (max-width:1024px) 50vw, 400px" />
                <figcaption>{g.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
