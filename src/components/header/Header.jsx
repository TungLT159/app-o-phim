import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./header.scss";
import logo from "../../assets/logo.png";
import { headerNav } from "../../constants/navigationData";
import SearchSuggestions from "./SearchSuggestions";
import useHeaderSearch from "./useHeaderSearch";

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const {
    keyword,
    suggestions,
    showSuggestions,
    isSearching,
    suggestionPosition,
    searchRef,
    handleSearchChange,
    handleSearchFocus,
    goToSearch,
    handleSuggestionClick,
    handleTouchStart,
    handleTouchEnd,
  } = useHeaderSearch({
    navigate,
    closeMobileMenu: () => setIsMobileMenuOpen(false),
  });

  const active = headerNav.findIndex((e) =>
    e.submenu?.some((sub) => pathname.startsWith(sub.path)),
  );

  useEffect(() => {
    const shrinkHeader = () => {
      headerRef.current?.classList.toggle("shrink", window.scrollY > 100);
    };
    shrinkHeader();
    window.addEventListener("scroll", shrinkHeader, { passive: true });
    return () => window.removeEventListener("scroll", shrinkHeader);
  }, []);

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <>
      <div ref={headerRef} className="header">
        <div className="header__wrap container">
          {/* Logo */}
          <div className="logo">
            <img src={logo} alt="" />
            <Link to="/">Ổ Phim</Link>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className="hamburger"
            aria-label="Mở menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            ☰
          </button>

          {/* Desktop Nav */}
          <ul className="header__nav desktop">
            {headerNav.map((e, i) => (
              <li
                key={e.display}
                className={`nav-item ${i === active ? "active" : ""}`}
              >
                <span>{e.display}</span>

                <ul className="nav-submenu">
                  {e.submenu?.map((sub) => (
                    <li key={sub.path}>
                      <Link to={sub.path}>{sub.display}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* Search */}
          <form
            className="header__search"
            onSubmit={goToSearch}
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Nhập tên phim…"
              value={keyword}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            <button type="submit">🔍</button>
          </form>
        </div>
      </div>

      {/* Search Suggestions Dropdown - Outside header, position fixed */}
      <SearchSuggestions
        showSuggestions={showSuggestions}
        isSearching={isSearching}
        suggestions={suggestions}
        suggestionPosition={suggestionPosition}
        onSuggestionClick={handleSuggestionClick}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-header">
          <span>Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        {/* 🔥 Mobile Search */}
        <form className="mobile-search" onSubmit={goToSearch}>
          <input
            type="text"
            placeholder="Nhập tên phim…"
            value={keyword}
            onChange={handleSearchChange}
          />
          <button type="submit">🔍</button>

          {/* Mobile Search Suggestions */}
          <SearchSuggestions
            isMobile
            showSuggestions={showSuggestions}
            isSearching={isSearching}
            suggestions={suggestions}
            suggestionPosition={suggestionPosition}
            onSuggestionClick={handleSuggestionClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        </form>
        <ul>
          {headerNav.map((e, i) => (
            <li key={e.display}>
              <button
                type="button"
                className="mobile-parent"
                aria-expanded={openSubmenu === i}
                aria-controls={`mobile-submenu-${i}`}
                onClick={() => toggleSubmenu(i)}
              >
                {e.display}
                <span>{openSubmenu === i ? "-" : "+"}</span>
              </button>

              <ul
                id={`mobile-submenu-${i}`}
                className={`mobile-submenu ${openSubmenu === i ? "show" : ""}`}
              >
                {e.submenu?.map((sub) => (
                  <li key={sub.path}>
                    <Link
                      to={sub.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {sub.display}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          className="overlay"
          aria-label="Đóng menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
