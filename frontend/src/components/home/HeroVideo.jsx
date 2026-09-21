const HeroVideo = () => {
  const handleTimeUpdate = (e) => {
    if (e.currentTarget.currentTime >= 27) {
      e.currentTarget.currentTime = 0;
      e.currentTarget.play();
    }
  };

  return (
    <div className="flex justify-center bg-black">
      <section className="w-full overflow-hidden bg-black flex justify-center">
        <video
          className="block h-142 w-full object-cover"
          autoPlay
          muted
          playsInline
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = 0;
          }}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src="/video/CompanyIntro.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>
    </div>
  );
};

export default HeroVideo;