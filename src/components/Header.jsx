import { useState, useEffect } from "react";
import NavLink from "./helpers/NavLink";

const Header = () => {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="px-32 w-full">
      <div className="w-full relative">
        <nav
          className="w-full px-32 pt-5 
            fixed top-0 left-0 z-15
          bg-myWhite/50 backdrop-blur-md"
        >
          <div
            className="px-32 py-5 flex items-center justify-center bg-myGray/8 
              backdrop-blur-md rounded-sm shadow-md"
          >
            <div className="w-full flex items-center justify-between">
              <h1 className="text-2xl font-bold">SUPmanager</h1>

              <div className="flex gap-8">
                <NavLink href="#home" label="Home" active={active} />
                <NavLink href="#addHero" label="Add Hero" active={active} />
                <NavLink href="#library" label="Library" active={active} />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};
export default Header;
