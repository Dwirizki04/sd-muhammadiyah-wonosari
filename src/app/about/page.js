// src/app/about/page.js
import Image from 'next/image';

export default function About() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="school-name">Tentang Kami</h1>
            <p className="school-tagline">Mengenal lebih dekat profil dan sejarah SD Muhammadiyah Wonosari</p>
          </div>
        </div>
      </section>

      <section className="programs-section">
        <div className="container">
          <div className="about-content-grid">
            <div className="about-text">
              <h2 className="section-title" style={{textAlign: 'left'}}>Profil Sekolah</h2>
              <div className="about-paragraphs">
                <p><strong>SD Muhammadiyah Wonosari</strong> merupakan salah satu sekolah swasta di Kabupaten Gunungkidul di bawah naungan Majelis Pendidikan Dasar dan Menengah Muhammadiyah yang berdiri pada tanggal <strong>1 Agustus 1963</strong>.</p>
                <br />
                <p>Sekolah terletak di daerah dengan keragaman kondisi sosial dan budaya masyarakat. Lokasi sekolah dekat dengan pusat kota ini menyebabkan beragamnya latar belakang dari peserta didik dan orang tua.</p>
                <br />
                <p>Sebagai salah satu sekolah yang berbasis agama, SD Muhammadiyah Wonosari berkomitmen tidak hanya berfokus pada pendidikan di bidang akademik, melainkan juga mengedepankan pendidikan agama dan pembentukan karakter.</p>
              </div>

              <h2 className="section-title" style={{marginTop: '60px', textAlign: 'left'}}>Visi & Misi</h2>
              
              <div className="vision-mission-grid" style={{display: 'grid', gap: '20px', marginTop: '20px'}}>
                <div className="vision-card program-card" style={{padding: '20px'}}>
                   <div className="benefit-icon"><i className="fas fa-bullseye"></i></div>
                   <h3>Visi</h3>
                   <p><em>"Terwujudnya generasi Muhammadiyah yang Berkualitas dan Memiliki Integritas Tinggi terhadap Bangsa, Negara, dan Agama"</em></p>
                </div>
                
                <div className="mission-card program-card" style={{padding: '20px'}}>
                   <div className="benefit-icon"><i className="fas fa-tasks"></i></div>
                   <h3>Misi</h3>
                   <ul style={{listStyle: 'disc', paddingLeft: '20px', fontSize: '0.9rem', color: '#666'}}>
                       <li>Menyelenggarakan penanaman karakter (<em>Character building</em>)</li>
                       <li>Melaksanakan pembiasaan dan keteladanan</li>
                       <li>Menyelenggarakan pelatihan Baitul Arqam</li>
                       <li>Pelatihan kepemimpinan Hizbul Wathan</li>
                   </ul>
                </div>
              </div>
            </div>
            
            <div className="about-images">
              <div className="image-comparison" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div className="old-school">
                   <Image src="/images/foto sekolah dulu.jpg" alt="Sekolah Dulu" width={500} height={300} style={{borderRadius: '10px'}} />
                   <div className="image-caption" style={{textAlign: 'center', marginTop: '5px', fontStyle: 'italic'}}>Tahun 1985</div>
                </div>
                <div className="new-school">
                   <Image src="/images/foto sekolah.jpg" alt="Sekolah Sekarang" width={500} height={300} style={{borderRadius: '10px'}} />
                   <div className="image-caption" style={{textAlign: 'center', marginTop: '5px', fontStyle: 'italic'}}>Sekarang</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}