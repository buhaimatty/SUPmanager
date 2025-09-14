const NavLink = ({ href, label, active }) => {
  const id = href.replace("#", "");
  const isActive = active === id;

  return (
    <a
      href={href}
      className={`
        font-light
        relative inline-block 
        after:content-[''] after:absolute after:left-0 after:-bottom-1
        after:h-[0.1em] after:w-0 after:bg-primary after:transition-all after:duration-300
        ${isActive ? "after:w-full font-medium" : "after:w-0"}
      `}
    >
      {label}
    </a>
  );
};

export default NavLink;
