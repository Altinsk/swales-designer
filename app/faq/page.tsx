// app/faq/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "How to Use the Designer | Swales",
  description:
    "A complete guide to the Swales garden designer: the top action bar, the tools & objects panel, the view controls panel, and a suggested permaculture design workflow.",
};

const ZONES: { name: string; color: string; description: string }[] = [
  {
    name: "Zone 0",
    color: "#FF7043",
    description: "The house or dwelling itself — the center of daily life.",
  },
  {
    name: "Zone 1",
    color: "#FFD54F",
    description:
      "Visited every day: kitchen garden, herbs, seedlings — things that need frequent attention.",
  },
  {
    name: "Zone 2",
    color: "#81C784",
    description:
      "Tended a few times a week: orchards, larger vegetable beds, chicken coops, compost.",
  },
  {
    name: "Zone 3",
    color: "#388E3C",
    description:
      "Main crops and pasture: larger-scale plantings, main livestock grazing areas.",
  },
  {
    name: "Zone 4",
    color: "#8D6E63",
    description:
      "Semi-managed land: woodlots, windbreaks, foraging areas, minimal intervention.",
  },
  {
    name: "Zone 5",
    color: "#004D40",
    description:
      "Wild, unmanaged land left for nature to take its course and for observation.",
  },
];

type ObjectCategory = {
  name: string;
  description: string;
  subcategories?: { name: string; description: string }[];
};

const OBJECT_CATEGORIES: ObjectCategory[] = [
  {
    name: "Structures",
    description: "Buildings and built outdoor features.",
    subcategories: [
      {
        name: "Buildings",
        description:
          "The house and a range of building footprints (gabled, hip-roof, domed, tower, and more) for structures on your plot.",
      },
      {
        name: "Outdoor Features",
        description:
          "Pools, patios, seating, umbrellas, grills, pergolas, and fire pits for outdoor living areas.",
      },
    ],
  },
  {
    name: "Plant Systems",
    description: "Every kind of planting, organized by role and layer.",
    subcategories: [
      {
        name: "Trees",
        description:
          "Deciduous, evergreen, and palm trees for shade, windbreaks, and the canopy layer of a food forest.",
      },
      {
        name: "Hedges",
        description:
          "Clipped hedge blocks, borders, and topiary shapes for boundaries and screening.",
      },
      {
        name: "Shrubs & Flowers",
        description: "Ornamental shrubs, flowering plants, and potted greenery.",
      },
      {
        name: "Groundcover",
        description:
          "Low, spreading foliage mats and panels for covering bare soil between other plantings.",
      },
      {
        name: "Shade Plants",
        description: "Understory and shade-loving foliage plants for shaded zones.",
      },
      {
        name: "Perennial Plants",
        description: "Perennial flowers and foliage that return year after year.",
      },
      {
        name: "Annual Plants",
        description: "Seasonal flowering plants such as tulips and posies.",
      },
      {
        name: "Pollinator Plants",
        description: "Roses, jasmine, and bouvardia that attract bees and pollinators.",
      },
      {
        name: "Windbreak Plants",
        description: "Dense pittosporum plantings used to break prevailing wind.",
      },
      {
        name: "Herb Spiral",
        description: "Herbs suited to a classic permaculture herb spiral.",
      },
      {
        name: "Food Forest Layers",
        description:
          "Canopy and understory food-producing trees and plants — figs, bananas, palms, and more.",
      },
    ],
  },
  {
    name: "Animals & Livestock",
    description:
      "Cows, horses, dogs, cats, rabbits, and beekeeping equipment for planning livestock and pet areas.",
  },
  {
    name: "Water Systems",
    description:
      "Ponds, rain barrels, cisterns, catchment points, and water-monitoring symbols.",
  },
  {
    name: "Kitchen Garden",
    description: "Herbs, seedlings, and planter boxes for a household vegetable garden.",
  },
  {
    name: "Energy Systems",
    description: "Solar panels, single units and arrays.",
  },
  {
    name: "Soil & Fertility",
    description: "Compost bins and mulch piles.",
  },
  {
    name: "Wind Path Symbols",
    description: "Diagram symbols for marking prevailing wind direction and turbulence.",
  },
  {
    name: "Smell Symbols",
    description: "Diagram symbols for marking fragrance and odor zones.",
  },
  {
    name: "Sun Path Symbols",
    description: "Diagram symbols for marking seasonal sun arcs and sun position.",
  },
  {
    name: "Garden",
    description: "Raised beds, plot outlines, and row crop markers.",
  },
  {
    name: "Contour Symbols",
    description: "Diagram symbols for elevation points, slope direction, and contour lines.",
  },
  {
    name: "Social & Culture Spaces",
    description: "Gathering spaces — fire pits, dining sets, and market stalls.",
  },
  {
    name: "Climate & Edge Strategies",
    description:
      "Living fences, pond edges, and trellis/arbor structures used for microclimate design.",
  },
  {
    name: "Food Storage",
    description: "Root cellars, canning stations, and solar dehydrators.",
  },
  {
    name: "Observation",
    description: "Weather stations, soil sensors, and water level gauges for monitoring your site.",
  },
  {
    name: "Materials",
    description: "Rain barrel stands, mulch depots, and straw bales.",
  },
  {
    name: "Wildlife & Habitat Support",
    description: "Frog ponds, bird houses, and wildflower meadows that support biodiversity.",
  },
];

const NAV_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#top-bar", label: "Top Action Bar" },
  { href: "#left-toolbar", label: "Tools & Objects" },
  { href: "#right-toolbar", label: "View Controls" },
  { href: "#workflow", label: "Suggested Workflow" },
];

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-[#262626] mb-4 scroll-mt-24 pt-2"
    >
      {children}
    </h2>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="font-bold text-lg text-[#262626]">
            Swales <span className="text-green-600">Designer</span>
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Back to Designer
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-10">
        {/* In-page navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] mb-2">
              On this page
            </p>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block px-2 py-1.5 rounded-md text-sm text-[#404040] hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#262626] mb-2">
            How to Use the Designer
          </h1>
          <p className="text-[#525252] mb-10 max-w-2xl">
            The Swales designer is a 2D, top-down planning tool — everything you
            place is drawn as if you were looking straight down at your land from
            above, the same way a real site plan is drawn. This guide walks through
            every bar and tool in the app.
          </p>

          {/* Overview */}
          <section className="mb-14">
            <SectionHeading id="overview">Overview: the three bars</SectionHeading>
            <p className="text-[#525252] mb-4">
              The designer screen is built around three toolbars, plus the zoom
              controls at the bottom of the canvas:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-[#262626] mb-1">Top Action Bar</p>
                <p className="text-sm text-[#737373]">
                  Runs across the top-center of the screen. Save, undo/redo, print,
                  share, start a new drawing, and load templates or saved gardens.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-[#262626] mb-1">Tools & Objects (left)</p>
                <p className="text-sm text-[#737373]">
                  Sits on the left. Draw the plot, mark permaculture zones, place
                  every object in the library, and add text/shape notes.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-[#262626] mb-1">View Controls (right)</p>
                <p className="text-sm text-[#737373]">
                  Sits on the right. Recenter the canvas and toggle the visibility
                  of the grid, sketch layer, items, and notes.
                </p>
              </div>
            </div>
          </section>

          {/* Top bar */}
          <section className="mb-14">
            <SectionHeading id="top-bar">Top Action Bar</SectionHeading>
            <p className="text-[#525252] mb-4">
              The left side of the bar handles the current drawing; the right side
              handles starting new drawings and loading saved work.
            </p>
            <ul className="space-y-3">
              {[
                ["Save / Save As", "Save changes to your current garden, or save a copy under a new name. Requires being logged in."],
                ["Delete Selected", "Remove the currently selected object, polygon, or note from the canvas."],
                ["Share", "Generate a shareable link to your garden design."],
                ["Undo / Redo", "Step backward or forward through your recent changes (Ctrl+Z / Ctrl+Y)."],
                ["Print", "Print the current design. Requires being logged in."],
                ["Planning Sketch", "Upload a reference image (like a survey or hand sketch) to trace over. Once uploaded, hover the icon for layer order (bring to front / send to back), reposition, lock/unlock, and delete controls."],
                ["New Drawing", "Start a fresh garden. Walks you through positioning your plot, choosing a shape, and setting its real-world size."],
                ["Templates", "Load one of the pre-made permaculture starter layouts as a base to build on."],
                ["My Gardens", "Open a recently saved garden, or browse and manage all of your saved gardens (visible once logged in)."],
              ].map(([title, desc]) => (
                <li key={title} className="bg-white rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-[#262626]">{title}</p>
                  <p className="text-sm text-[#737373]">{desc}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Left toolbar */}
          <section className="mb-14">
            <SectionHeading id="left-toolbar">Tools & Objects (Left Toolbar)</SectionHeading>

            <h3 className="text-lg font-semibold text-[#262626] mb-2 mt-6">Tools</h3>
            <ul className="space-y-3 mb-8">
              <li className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="font-semibold text-[#262626]">Select &amp; Move</p>
                <p className="text-sm text-[#737373]">
                  The default tool. Click an object, polygon, or note to select it,
                  then drag to move, use the handles to resize/rotate, or drag a
                  selection box across empty canvas to multi-select.
                </p>
              </li>
              <li className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="font-semibold text-[#262626]">Plot Area</p>
                <p className="text-sm text-[#737373]">
                  Draw the outline of your land or a section of it, filled with a
                  Grass, Paving Stones, or Wood texture. Click to place corner
                  points, then close the shape.
                </p>
              </li>
              <li className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="font-semibold text-[#262626] mb-2">
                  Zones — permaculture zone planning
                </p>
                <p className="text-sm text-[#737373] mb-3">
                  Draw outlined regions (no fill) representing permaculture zones —
                  areas grouped by how often they need attention, radiating out
                  from the house:
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ZONES.map((zone) => (
                    <div key={zone.name} className="flex items-start gap-2">
                      <span
                        className="w-4 h-4 rounded-sm mt-0.5 flex-shrink-0 border border-black/10"
                        style={{ backgroundColor: zone.color }}
                      />
                      <p className="text-sm text-[#525252]">
                        <span className="font-semibold text-[#404040]">{zone.name}:</span>{" "}
                        {zone.description}
                      </p>
                    </div>
                  ))}
                </div>
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-[#262626] mb-2">Objects</h3>
            <p className="text-sm text-[#525252] mb-4">
              Hover any category to open its items (categories with subcategories
              open one more level). Click an item to drop it onto the canvas at
              actual scale — drag, resize, and rotate it like any other object.
            </p>
            <div className="space-y-3 mb-8">
              {OBJECT_CATEGORIES.map((cat) => (
                <div key={cat.name} className="bg-white rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-[#262626]">{cat.name}</p>
                  <p className="text-sm text-[#737373] mb-2">{cat.description}</p>
                  {cat.subcategories && (
                    <ul className="pl-4 border-l-2 border-gray-100 space-y-1.5 mt-2">
                      {cat.subcategories.map((sub) => (
                        <li key={sub.name}>
                          <span className="text-sm font-medium text-[#404040]">
                            {sub.name}:
                          </span>{" "}
                          <span className="text-sm text-[#737373]">{sub.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-[#262626] mb-2">Notes</h3>
            <p className="text-sm text-[#525252]">
              Add annotations on top of the design: <span className="font-medium text-[#404040]">Text</span>,{" "}
              <span className="font-medium text-[#404040]">Rectangle</span>,{" "}
              <span className="font-medium text-[#404040]">Oval</span>,{" "}
              <span className="font-medium text-[#404040]">Callout</span>, and{" "}
              <span className="font-medium text-[#404040]">Arrow</span> — useful for
              labeling zones, leaving instructions, or pointing out a detail.
            </p>
          </section>

          {/* Right toolbar */}
          <section className="mb-14">
            <SectionHeading id="right-toolbar">View Controls (Right Toolbar)</SectionHeading>
            <ul className="space-y-3">
              {[
                ["Center Canvas", "Recenter and fit the whole design in view."],
                ["Grid", "Show or hide the measurement grid (each cell represents 1 meter)."],
                ["Planning Sketch", "Show or hide the uploaded reference image, if you've added one."],
                ["Items", "Show or hide every placed object on the canvas."],
                ["Notes", "Show or hide text and shape notes."],
              ].map(([title, desc]) => (
                <li key={title} className="bg-white rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-[#262626]">{title}</p>
                  <p className="text-sm text-[#737373]">{desc}</p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#525252] mt-4">
              At the bottom of the canvas, the zoom controls (+/−) let you zoom in
              and out, alongside a scale bar showing the current real-world
              distance represented on screen.
            </p>
          </section>

          {/* Workflow */}
          <section className="mb-14">
            <SectionHeading id="workflow">Suggested design workflow</SectionHeading>
            <ol className="space-y-3 list-decimal list-inside">
              {[
                "Start a New Drawing and set your plot to its real-world size and shape.",
                "Use the Plot Area tool to lay down the ground texture for your site.",
                "Use the Zones tool to sketch Zone 0 through 5 radiating out from the house, based on how often each area will be visited.",
                "Place Structures — the house, and any outdoor features.",
                "Work zone by zone, placing the Objects that belong there: Kitchen Garden and Herb Spiral in Zone 1, orchards and Food Forest Layers in Zone 2, pasture and Animals & Livestock in Zone 3, windbreaks in Zone 4, and leave Zone 5 unplanted.",
                "Layer in Water Systems, Energy Systems, and Climate & Edge Strategies where they support the zones around them.",
                "Use Notes to label features or leave instructions for anyone else viewing the plan.",
                "Save your garden, then use Share or Print to hand it off.",
              ].map((step) => (
                <li key={step} className="text-[#525252] pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <div className="border-t border-gray-200 pt-8 flex justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Back to Designer
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
