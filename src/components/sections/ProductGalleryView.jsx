"use client";
import { ImgArr } from "@/components/data/GalleryData.jsx";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ProductGalleryView = () => {
  const scrollContDiv = useRef(null);
  const contentContainerWrap = useRef(null);
  const lenisRef = useRef(null);

  // Refs for the new scroll progress indicator
  const progressTextRef = useRef(null);
  const progressCircleRef = useRef(null);

  // Keep a reference to all image wrappers for dynamic measurement
  const itemRefs = useRef([]);
  const [expandData, setExpandData] = useState(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const wrap = contentContainerWrap.current;

      const getScrollAmount = () => {
        const scrollWidth = wrap.scrollWidth;
        const viewportWidth = window.innerWidth;
        return -(scrollWidth - viewportWidth);
      };

      // 1. Horizontal Scroll Animation
      gsap.to(wrap, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: scrollContDiv.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // 2. Scroll Progress Indicator Animation
      ScrollTrigger.create({
        trigger: scrollContDiv.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // Calculate percentage
          const progress = self.progress;
          const percentage = Math.round(progress * 100);

          // Update text directly
          if (progressTextRef.current) {
            progressTextRef.current.innerText = `${percentage}%`;
          }

          // Update SVG Circle stroke-dashoffset directly
          if (progressCircleRef.current) {
            // Radius is 26. Circumference = 2 * Math.PI * 26 ≈ 163.36
            const circumference = 2 * Math.PI * 26;
            const offset = circumference - progress * circumference;
            progressCircleRef.current.style.strokeDashoffset = offset;
          }
        },
      });
    }, scrollContDiv);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Handle Opening the Image
  const handleOpen = (index, item) => {
    const el = itemRefs.current[index];
    const rect = el.getBoundingClientRect();

    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";

    setExpandData({
      item,
      index,
      rect,
      isExpanded: false,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandData((prev) => ({ ...prev, isExpanded: true }));
      });
    });
  };

  // Handle Closing the Image
  const handleClose = () => {
    const el = itemRefs.current[expandData.index];
    const currentRect = el.getBoundingClientRect();

    setExpandData((prev) => ({
      ...prev,
      rect: currentRect,
      isExpanded: false,
    }));

    setTimeout(() => {
      setExpandData(null);
      lenisRef.current?.start();
      document.body.style.overflow = "auto";
    }, 700);
  };

  return (
    <>
      <div ref={scrollContDiv} className="w-full h-[700svh] bg-[#f2f9f2] relative">
        <div className="w-full h-svh overflow-hidden flex items-center bg-[#f2f9f2] sticky top-0 left-0">
          <div
            ref={contentContainerWrap}
            className="w-fit flex items-center h-fit gap-10 max-sm:px-[25vw] sm:px-[40vw] will-change-transform"
          >
            {ImgArr.map((item, index) => {
              return (
                <div
                  key={index}
                  className="group w-fit h-fit flex flex-col relative"
                >
                  <div className="w-full h-fit absolute pointer-events-none top-[-8%] opacity-0 transition-all duration-500 ease-out group-hover:opacity-100">
                    <h2 className="uppercase tracking-tighter">{item.title}</h2>
                  </div>

                  <div
                    ref={(el) => (itemRefs.current[index] = el)}
                    onClick={() => handleOpen(index, item)}
                    className="img-wrapper w-[180px] group-hover:w-[300px] relative transition-all duration-500 ease-out cursor-pointer shrink-0 aspect-[4/5] bg-pink-300 overflow-hidden"
                  >
                    <img
                      src={item.image}
                      alt="IMG"
                      className="w-full h-full object-cover object-center pointer-events-none"
                    />
                    <div className="w-[40px] h-[40px] flex justify-center items-center opacity-0 text-black text-[1.2rem] hover:scale-[1.1] transition-all duration-500 ease-out group-hover:opacity-100 backdrop-blur-[2px] rounded-full bg-white/90 absolute bottom-5 left-5">
                      <RiFullscreenFill />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOP Fixed Text */}
      <div className="w-full p-5  fixed text-[0.7rem] sm:text-[0.8rem] top-[0%] leading-[0.9rem] grid grid-cols-[1fr_1fr_1fr] gap-5 text-justify  left-[0%] ">
        <div className="w-full h-full justify-start  font-semibold tracking-tighter items-center">
          OWN 
        </div>
        <div className="w-full h-full  font-semibold flex justify-center  tracking-tighter items-start">
          (STUDIO)
        </div>
        <div className="w-full h-full  font-semibold flex flex-col   tracking-tighter items-end">
          <p>HOME</p>
          <p>ABOUT</p>
          <p>PRODUCTS</p>
        </div>
      </div>

      {/* Bottom Fixed Text */}
      <div className="w-full p-5  fixed bottom-[0%] text-[0.7rem] sm:text-[0.8rem] leading-[0.9rem] grid grid-cols-[1fr_3fr_1fr] gap-10 text-justify  left-[0%] ">
        <div className="w-full h-full flex justify-start  font-semibold tracking-tighter items-end">
          SCROLL
        </div>
        <div className="w-full h-full flex-col uppercase  font-semibold flex justify-center  tracking-tighter items-start">
          <p>Explore 2026</p>
          <p>Premium Collections</p>
          <p>Limited Products</p>
        </div>
        <div className="w-full h-full  font-semibold flex flex-col tracking-tighter items-end">
          
        </div>
      </div>

      {/* --- Scroll Progress Indicator --- */}
      <div className="fixed bottom-8 right-8 z-[30] flex items-center justify-center w-[70px] h-[70px] rounded-full bg-white/50 ">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
          {/* Background Track Circle */}
          <circle
            cx="30"
            cy="30"
            r="26"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-300/50"
          />
          {/* Active Progress Circle */}
          <circle
            ref={progressCircleRef}
            cx="30"
            cy="30"
            r="26"
            stroke="black"
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
            style={{
              strokeDasharray: 163.36, // 2 * Math.PI * 26
              strokeDashoffset: 163.36, // Start at 0%
            }}
          />
        </svg>
        {/* Dynamic Percentage Text */}
        <span
          ref={progressTextRef}
          className="absolute text-[13px] z-99 font-bold text-[#202020] tracking-tighter"
        >
          0%
        </span>
      </div>

      {/* --- Seamless Expanding Clone Overlay --- */}
      {expandData && (
        <>
          <div
            className={`fixed inset-0 z-[40] bg-[#202020]/95 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              expandData.isExpanded ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className="fixed z-[50] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              top: expandData.isExpanded ? 0 : expandData.rect.top,
              left: expandData.isExpanded ? 0 : expandData.rect.left,
              width: expandData.isExpanded ? "100vw" : expandData.rect.width,
              height: expandData.isExpanded ? "100vh" : expandData.rect.height,
              borderRadius: expandData.isExpanded ? "0px" : "0px",
            }}
          >
            <img
              src={expandData.item.image}
              alt="Full Screen"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <button
            onClick={handleClose}
            className={`fixed top-8 left-8 w-[50px] h-[50px] rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-white text-3xl hover:bg-white/30 hover:scale-110 transition-all duration-500 cursor-pointer z-[60] ${
              expandData.isExpanded ? "opacity-100 delay-300" : "opacity-0"
            }`}
          >
            <RiFullscreenExitFill className="text-black scale-[0.8]" />
          </button>
        </>
      )}
    </>
  );
};

export default ProductGalleryView;
