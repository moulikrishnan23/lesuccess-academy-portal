const OfferHeader = () => {
  return (
    <div className="w-full bg-linear-to-r from-[#ff3b3f] to-[#cc0f4f] text-white">
      <div className="mx-auto flex min-h-13.75 flex-wrap items-center justify-center gap-3 px-4 py-2 text-center">
        <p className="text-sm font-semibold sm:text-base md:text-lg">
          Data Analytics Course - 30% Offer 10Days Only - Limited Seats!
        </p>

        <button
          className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-[#e51d48]
          transition hover:bg-gray-100
          animate-pulse"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
};

export default OfferHeader;