import TopBar from "../components/TopBar";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <div className="hero-header" style={{ textAlign: "center", padding: "30px" }}>
        Despre Noi
      </div>
      <div className="main-content">
        <div className="intro-text">
          <p style={{ color: "#000000"}}>Soon</p>
        </div>
      </div>
    </>
  );
}