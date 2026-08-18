// components/Toolbar.tsx

"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, Search, X } from "lucide-react";
import { ActiveTool, NoteShape } from "@/app/page";

// --- Type Definitions (no changes) ---
export type Tool = "select" | "plot" | "zone";
export interface Texture {
  id: string;
  name: string;
  src: string;
}
export interface ZoneOption {
  id: string;
  name: string;
  color: string;
}
interface PlotToolConfig {
  id: "plot";
  name: string;
  type: "menu";
  textures: Texture[];
}
interface ZoneToolConfig {
  id: "zone";
  name: string;
  type: "menu";
  options: ZoneOption[];
}
export interface PresetItem {
  id: string;
  name: string;
  type: "item";
  src: string;
}
export interface PresetCategory {
  id: string;
  name: string;
  type: "category";
  icon?: string;
  children?: (PresetItem | PresetCategory)[];
}
export type Preset = PresetItem | PresetCategory;

interface ToolbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  onSelectPreset: (preset: PresetItem) => void;
  onSelectTexture: (texture: Texture) => void;
  onSelectZone: (zone: ZoneOption) => void;
  onSelectNoteTool: (shape: NoteShape) => void;
  config: {
    tools: (PlotToolConfig | ZoneToolConfig)[];
    objects: Preset[];
  };
  className?: string;
}

// --- Data (no changes) ---
const icons = {
  text: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cpath d='M12 18V6'%3E%3C/path%3E%3Cpath d='M8 6h8'%3E%3C/path%3E%3Cpath d='M8 12h8'%3E%3C/path%3E%3Cpath d='M8 18h8'%3E%3C/path%3E%3C/svg%3E",
  rectangle:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3C/svg%3E",
  oval: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cellipse cx='12' cy='12' rx='10' ry='6'%3E%3C/ellipse%3E%3C/svg%3E",
  callout:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'%3E%3C/path%3E%3C/svg%3E",
  arrow:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E",
  zone: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 3v18h18'%3E%3C/path%3E%3Cpath d='M18.7 8l-5.1 5.2-2.8-2.7L7 14.3'%3E%3C/path%3E%3C/svg%3E",
};
const noteTools: PresetCategory = {
  id: "notes-category",
  name: "Notes",
  type: "category",
  children: [
    { id: "note-text", name: "Text", type: "item", src: icons.text },
    {
      id: "note-rectangle",
      name: "Rectangle",
      type: "item",
      src: icons.rectangle,
    },
    { id: "note-oval", name: "Oval", type: "item", src: icons.oval },
    { id: "note-callout", name: "Callout", type: "item", src: icons.callout },
    { id: "note-arrow", name: "Arrow", type: "item", src: icons.arrow },
  ],
};

// --- Search helper: flattens the (possibly nested) preset tree into a
// list of leaf items, each tagged with the category path it lives under,
// so the search results can show items regardless of nesting depth. ---
interface FlatPresetItem {
  item: PresetItem;
  path: string[];
}

function flattenPresets(
  presets: Preset[],
  path: string[] = []
): FlatPresetItem[] {
  const results: FlatPresetItem[] = [];
  for (const preset of presets) {
    if (preset.type === "item") {
      results.push({ item: preset, path });
    } else {
      results.push(
        ...flattenPresets(preset.children ?? [], [...path, preset.name])
      );
    }
  }
  return results;
}

// --- Flyout positioning helper ---
// Flyouts are switched to `position: fixed` with a JS-computed, viewport-aware
// position instead of CSS `absolute left-full`. This keeps them out of the
// scrollable-overflow calculation of the panel that hosts them (which is what
// was causing a phantom horizontal scrollbar, and a large phantom vertical gap
// for panels with many items, since `overflow-y: auto` implicitly resolves
// `overflow-x` to `auto` too per the CSS spec) and guarantees the flyout is
// always fully visible on hover instead of opening off-screen.
const FLYOUT_MARGIN = 8;

function computeFlyoutPosition(anchorRect: DOMRect, panelRect: DOMRect) {
  let left = anchorRect.right + 4;
  if (left + panelRect.width > window.innerWidth - FLYOUT_MARGIN) {
    left = anchorRect.left - panelRect.width - 4;
  }
  left = Math.max(
    FLYOUT_MARGIN,
    Math.min(left, window.innerWidth - panelRect.width - FLYOUT_MARGIN)
  );

  let top = anchorRect.top;
  if (top + panelRect.height > window.innerHeight - FLYOUT_MARGIN) {
    top = window.innerHeight - panelRect.height - FLYOUT_MARGIN;
  }
  top = Math.max(FLYOUT_MARGIN, top);

  return { top, left };
}

// Renders the flyout panel through a portal to document.body. This is
// required (not just nice-to-have): the toolbar panel uses `backdrop-blur-sm`
// (backdrop-filter), and per the CSS spec an ancestor with a filter/backdrop-
// filter/transform becomes the containing block for `position: fixed`
// descendants. Without the portal, "fixed" flyouts end up positioned relative
// to the small toolbar box instead of the real viewport.
const FlyoutPortal: React.FC<{
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  children: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({ anchorRef, open, children, onMouseEnter, onMouseLeave }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: "fixed",
    top: -9999,
    left: -9999,
    visibility: "hidden",
    pointerEvents: "none",
  });

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) {
      setStyle((s) => ({ ...s, visibility: "hidden", pointerEvents: "none" }));
      return;
    }
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const { top, left } = computeFlyoutPosition(
      anchor.getBoundingClientRect(),
      panel.getBoundingClientRect()
    );
    setStyle({
      position: "fixed",
      top,
      left,
      visibility: "visible",
      pointerEvents: "auto",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="p-2 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg w-max max-h-[calc(100vh-16px)] overflow-y-auto z-[999]"
    >
      {children}
    </div>,
    document.body
  );
};

// Small delay before a hover-opened flyout actually closes, so moving the
// cursor from the trigger into the (portal-rendered, physically separate)
// flyout panel doesn't get read as "left the menu" and slam it shut before
// the user arrives.
const FLYOUT_CLOSE_DELAY = 250;

function useHoverFlyout(prefersHover: boolean) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => clearCloseTimer, []);

  const openNow = () => {
    if (!prefersHover) return;
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    if (!prefersHover) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(
      () => setOpen(false),
      FLYOUT_CLOSE_DELAY
    );
  };

  return { open, setOpen, openNow, scheduleClose };
}

const ObjectMenuItem: React.FC<{
  item: Preset;
  onSelectPreset: (preset: PresetItem) => void;
  prefersHover: boolean;
}> = ({ item, onSelectPreset, prefersHover }) => {
  const {
    open: isSubMenuOpen,
    setOpen: setIsSubMenuOpen,
    openNow: openSubMenu,
    scheduleClose: scheduleSubMenuClose,
  } = useHoverFlyout(prefersHover);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!prefersHover) {
      e.stopPropagation();
      setIsSubMenuOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (prefersHover || !isSubMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsSubMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSubMenuOpen, prefersHover]);

  if (item.type === "item") {
    return (
      <button
        onClick={() => onSelectPreset(item)}
        className="w-full flex items-center p-2 rounded-md hover:bg-green-100 text-[#404040] transition-colors duration-150"
        title={`Add ${item.name} to canvas`}
      >
        {" "}
        <img
          src={item.src}
          alt={item.name}
          className="h-5 w-5 mr-3 object-contain"
        />
        <span className="text-sm whitespace-nowrap">{item.name}</span>{" "}
      </button>
    );
  }

  const subMenuItems = item.children?.map((child) => (
    <ObjectMenuItem
      key={child.id}
      item={child}
      onSelectPreset={onSelectPreset}
      prefersHover={prefersHover}
    />
  ));

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={openSubMenu}
      onMouseLeave={scheduleSubMenuClose}
    >
      {" "}
      <div
        onClick={handleInteraction}
        className="flex items-center justify-between p-2 rounded-md hover:bg-green-100 text-[#404040] cursor-pointer"
      >
        {" "}
        <div className="flex items-center min-w-0">
          {" "}
          {item.icon && (
            <img
              src={item.icon}
              alt=""
              className="h-4 w-4 mr-2 shrink-0 text-[#404040]"
            />
          )}
          <span className="text-sm font-medium whitespace-nowrap">
            {item.name}
          </span>{" "}
        </div>{" "}
        <svg
          className={`w-4 h-4 text-[#a3a3a3] transition-transform duration-200 shrink-0 ${
            isSubMenuOpen && !prefersHover ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />{" "}
        </svg>{" "}
      </div>{" "}
      {prefersHover ? (
        // --- DESKTOP (HOVER): fly-out menu, positioned via JS so it always
        // opens fully on-screen (flips left/up instead of running off the
        // viewport) and never contributes to the parent panel's scroll area ---
        <FlyoutPortal
          anchorRef={itemRef}
          open={isSubMenuOpen}
          onMouseEnter={openSubMenu}
          onMouseLeave={scheduleSubMenuClose}
        >
          {subMenuItems}
        </FlyoutPortal>
      ) : (
        // --- MOBILE (CLICK): accordion menu for touch devices ---
        <div
          className={`pl-4 transition-all duration-300 ease-in-out ${
            isSubMenuOpen ? "max-h-60 overflow-y-auto" : "max-h-0 overflow-hidden"
          }`}
        >
          <div className="pt-1 space-y-1">{subMenuItems}</div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onSelectPreset,
  onSelectTexture,
  onSelectZone,
  onSelectNoteTool,
  config,
  className = "",
}) => {
  const plotToolConfig = config.tools.find((t) => t.id === "plot") as
    | PlotToolConfig
    | undefined;
  const zoneToolConfig = config.tools.find((t) => t.id === "zone") as
    | ZoneToolConfig
    | undefined;
  const [prefersHover, setPrefersHover] = useState(true);
  const {
    open: isPlotMenuOpen,
    setOpen: setIsPlotMenuOpen,
    openNow: openPlotMenu,
    scheduleClose: schedulePlotMenuClose,
  } = useHoverFlyout(prefersHover);
  const {
    open: isZoneMenuOpen,
    setOpen: setIsZoneMenuOpen,
    openNow: openZoneMenu,
    scheduleClose: scheduleZoneMenuClose,
  } = useHoverFlyout(prefersHover);
  const plotMenuRef = useRef<HTMLDivElement>(null);
  const zoneMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return flattenPresets(config.objects).filter(({ item }) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery, config.objects]);

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(pointer: fine)");
      setPrefersHover(mediaQuery.matches);
    }
  }, []);

  useEffect(() => {
    if (prefersHover) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        plotMenuRef.current &&
        !plotMenuRef.current.contains(event.target as Node)
      ) {
        setIsPlotMenuOpen(false);
      }
      if (
        zoneMenuRef.current &&
        !zoneMenuRef.current.contains(event.target as Node)
      ) {
        setIsZoneMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [prefersHover]);

  const handleSelectNote = (item: PresetItem) => {
    const shape = item.id.split("-")[1] as NoteShape;
    if (shape) {
      onSelectNoteTool(shape);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={updateScrollButtons}
      style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "hidden" }}
      className={`bg-white/90 backdrop-blur-sm p-3 w-60 rounded-xl shadow-lg flex flex-col space-y-4 z-10 transition-all duration-300 ${className}`}
    >
      <div className="sticky top-0 -mx-3 -mt-3 px-3 pt-3 pb-2 bg-white/95 backdrop-blur-sm z-20 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-8 pr-7 py-1.5 text-sm rounded-md border border-gray-200 bg-white text-[#404040] focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#404040]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {canScrollUp && !searchQuery && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={scrollToTop}
              title="Scroll to top"
              className="p-1 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 text-[#404040]"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {searchQuery.trim() ? (
        <div className="space-y-1">
          <h3 className="font-semibold text-[#737373] text-xs uppercase tracking-wider px-2">
            {searchResults.length} result
            {searchResults.length !== 1 ? "s" : ""}
          </h3>
          {searchResults.length === 0 ? (
            <p className="text-sm text-[#a3a3a3] px-2 py-4 text-center">
              No items found
            </p>
          ) : (
            searchResults.map(({ item, path }) => (
              <button
                key={item.id}
                onClick={() => onSelectPreset(item)}
                className="w-full flex items-center p-2 rounded-md hover:bg-green-100 text-[#404040] transition-colors duration-150"
                title={`Add ${item.name} to canvas`}
              >
                <img
                  src={item.src}
                  alt={item.name}
                  className="h-5 w-5 mr-3 object-contain shrink-0"
                />
                <span className="flex flex-col items-start min-w-0">
                  <span className="text-sm truncate w-full text-left">
                    {item.name}
                  </span>
                  {path.length > 0 && (
                    <span className="text-[10px] text-[#a3a3a3] truncate w-full text-left">
                      {path.join(" / ")}
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
      {" "}
      <div className="space-y-2">
        {" "}
        <h3 className="font-semibold text-[#737373] text-xs uppercase tracking-wider px-2">
          Tools
        </h3>{" "}
        <button
          onClick={() => setActiveTool({ type: "select" })}
          className={`w-full flex items-center p-2 rounded-lg text-left transition-all duration-200 ${
            activeTool.type === "select"
              ? "bg-green-600 text-white shadow"
              : "hover:bg-gray-100 text-[#404040]"
          }`}
        >
          {" "}
          <svg
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11"
            />{" "}
          </svg>
          <span className="text-sm font-medium">Select & Move</span>{" "}
        </button>{" "}
        {plotToolConfig && (
          <div
            className="relative"
            ref={plotMenuRef}
            onMouseEnter={openPlotMenu}
            onMouseLeave={schedulePlotMenuClose}
          >
            {" "}
            <div
              onClick={() => {
                if (!prefersHover) setIsPlotMenuOpen(!isPlotMenuOpen);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                activeTool.type === "plot"
                  ? "bg-green-600 text-white shadow"
                  : "hover:bg-gray-100 text-[#404040]"
              }`}
            >
              {" "}
              <div className="flex items-center">
                {" "}
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                  />{" "}
                </svg>{" "}
                <span className="text-sm font-medium">
                  {plotToolConfig.name}
                </span>{" "}
              </div>{" "}
              <svg
                className={`w-4 h-4 text-[#a3a3a3] transition-transform duration-200 ${
                  isPlotMenuOpen && !prefersHover ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />{" "}
              </svg>{" "}
            </div>{" "}
            {prefersHover ? (
              <FlyoutPortal
                anchorRef={plotMenuRef}
                open={isPlotMenuOpen}
                onMouseEnter={openPlotMenu}
                onMouseLeave={schedulePlotMenuClose}
              >
                {plotToolConfig.textures.map((texture) => (
                  <button
                    key={texture.id}
                    onClick={() => {
                      onSelectTexture(texture);
                      setIsPlotMenuOpen(false);
                    }}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                  >
                    {" "}
                    <img
                      src={texture.src}
                      alt={texture.name}
                      className="w-5 h-5 rounded-sm mr-3 object-cover"
                    />{" "}
                    <span className="text-sm">{texture.name}</span>{" "}
                  </button>
                ))}
              </FlyoutPortal>
            ) : (
              <div
                className={`pl-4 transition-all duration-300 ease-in-out ${
                  isPlotMenuOpen ? "max-h-60 overflow-y-auto" : "max-h-0 overflow-hidden"
                }`}
              >
                {" "}
                <div className="pt-2 space-y-1">
                  {" "}
                  {plotToolConfig.textures.map((texture) => (
                    <button
                      key={texture.id}
                      onClick={() => {
                        onSelectTexture(texture);
                        setIsPlotMenuOpen(false);
                      }}
                      className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                    >
                      {" "}
                      <img
                        src={texture.src}
                        alt={texture.name}
                        className="w-5 h-5 rounded-sm mr-3 object-cover"
                      />{" "}
                      <span className="text-sm">{texture.name}</span>{" "}
                    </button>
                  ))}{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
        {zoneToolConfig && (
          <div
            className="relative"
            ref={zoneMenuRef}
            onMouseEnter={openZoneMenu}
            onMouseLeave={scheduleZoneMenuClose}
          >
            {" "}
            <div
              onClick={() => {
                if (!prefersHover) setIsZoneMenuOpen(!isZoneMenuOpen);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                activeTool.type === "zone"
                  ? "bg-green-600 text-white shadow"
                  : "hover:bg-gray-100 text-[#404040]"
              }`}
            >
              {" "}
              <div className="flex items-center">
                {" "}
                {/* Use the SVG from icons object */}
                <img src={icons.zone} className="h-5 w-5 mr-3" alt="Zones" />
                <span className="text-sm font-medium">
                  {zoneToolConfig.name}
                </span>{" "}
              </div>{" "}
              <svg
                className={`w-4 h-4 text-[#a3a3a3] transition-transform duration-200 ${
                  isZoneMenuOpen && !prefersHover ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />{" "}
              </svg>{" "}
            </div>{" "}
            {prefersHover ? (
              <FlyoutPortal
                anchorRef={zoneMenuRef}
                open={isZoneMenuOpen}
                onMouseEnter={openZoneMenu}
                onMouseLeave={scheduleZoneMenuClose}
              >
                {zoneToolConfig.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSelectZone(option);
                      setIsZoneMenuOpen(false);
                    }}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                  >
                    {" "}
                    <div
                      className="w-5 h-5 rounded-sm mr-3"
                      style={{ backgroundColor: option.color }}
                    />{" "}
                    <span className="text-sm">{option.name}</span>{" "}
                  </button>
                ))}
              </FlyoutPortal>
            ) : (
              <div
                className={`pl-4 transition-all duration-300 ease-in-out ${
                  isZoneMenuOpen ? "max-h-60 overflow-y-auto" : "max-h-0 overflow-hidden"
                }`}
              >
                {" "}
                <div className="pt-2 space-y-1">
                  {" "}
                  {zoneToolConfig.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onSelectZone(option);
                        setIsZoneMenuOpen(false);
                      }}
                      className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                    >
                      {" "}
                      <div
                        className="w-5 h-5 rounded-sm mr-3"
                        style={{ backgroundColor: option.color }}
                      />{" "}
                      <span className="text-sm">{option.name}</span>{" "}
                    </button>
                  ))}{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div className="space-y-1">
        {" "}
        <h3 className="font-semibold text-[#737373] text-xs uppercase tracking-wider px-2">
          Objects
        </h3>{" "}
        {config.objects.map((item) => (
          <ObjectMenuItem
            key={item.id}
            item={item}
            onSelectPreset={onSelectPreset}
            prefersHover={prefersHover}
          />
        ))}{" "}
      </div>{" "}
      <div className="space-y-1 pt-2 border-t border-gray-200">
        {" "}
        <h3 className="font-semibold text-[#737373] text-xs uppercase tracking-wider px-2">
          Notes
        </h3>{" "}
        <ObjectMenuItem
          item={noteTools}
          onSelectPreset={handleSelectNote}
          prefersHover={prefersHover}
        />{" "}
      </div>{" "}
        </>
      )}
      {canScrollDown && (
        <div className="sticky bottom-0 -mx-3 -mb-3 px-3 pb-2 pt-3 flex justify-center bg-gradient-to-t from-white/95 to-white/0 z-20">
          <button
            type="button"
            onClick={scrollToBottom}
            title="Scroll to bottom"
            className="p-1 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 text-[#404040]"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
