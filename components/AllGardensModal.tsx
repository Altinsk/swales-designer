"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Modal from "./Modal";
import {
  Search,
  Image as ImageIcon,
  Trash2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  FilterX, // Icon for the new "Clear Filters" button
} from "lucide-react";

interface Project {
  ProjectId: number;
  Name: string;
  DateLastUpdated: string;
  ThumbnailUrl?: string;
}

interface AllGardensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (projectId: number) => void;
  onDeleteProject: (projectId: number) => Promise<void>;
}

export const AllGardensModal: React.FC<AllGardensModalProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  onDeleteProject,
}) => {
  const { token } = useAuth();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchAllGardens = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        sort: sortBy,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (dateRange.from) params.append("startDate", dateRange.from);
      if (dateRange.to) params.append("endDate", dateRange.to);

      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (res.data.success) {
        setProjects(res.data.data.projects);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch all gardens", err);
      setError("Could not load your gardens. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllGardens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPage, debouncedSearchTerm, sortBy, dateRange, token]);

  const handleLocalDelete = async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this garden? This cannot be undone."
      )
    ) {
      return;
    }
    await onDeleteProject(projectId);
    // Refresh the list after deletion
    fetchAllGardens();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortBy("date_desc");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-red-500 p-8">{error}</p>;
    }
    if (projects.length === 0) {
      return (
        <p className="text-center text-gray-500 p-8">
          No gardens found matching your criteria.
        </p>
      );
    }
    return (
      <div className="space-y-2">
        {projects.map((garden) => (
          <div
            key={garden.ProjectId}
            onClick={() => onLoadProject(garden.ProjectId)}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 w-full cursor-pointer transition-colors"
          >
            {garden.ThumbnailUrl ? (
              <img
                src={garden.ThumbnailUrl}
                alt={garden.Name}
                className="w-16 h-12 object-cover rounded-md mr-4 bg-gray-100"
              />
            ) : (
              <div className="w-16 h-12 flex items-center justify-center bg-gray-100 rounded-md mr-4">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-grow text-left">
              <p className="font-semibold truncate">{garden.Name}</p>
              <p className="text-xs text-gray-500">
                Updated: {new Date(garden.DateLastUpdated).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => handleLocalDelete(e, garden.ProjectId)}
              className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 ml-2 flex-shrink-0"
              title="Delete Garden"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Garden Plans">
      <div className="p-4 space-y-4">
        {/* --- IMPROVED FILTER AND SORT CONTROLS --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-gray-50  rounded-lg">
          {/* Primary Controls: Search & Sort */}
          <div className="flex items-center gap-4 flex-grow min-w-[300px]">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search gardens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="date_desc">Sort: Newest</option>
              <option value="date_asc">Sort: Oldest</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="name_desc">Sort: Name (Z-A)</option>
            </select>
          </div>

          {/* Secondary Controls: Date Range & Clear */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  setDateRange({ ...dateRange, from: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Filter by start date"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.to}
                min={dateRange.from || undefined}
                onChange={(e) => {
                  setDateRange({ ...dateRange, to: e.target.value });
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Filter by end date"
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-md transition-colors"
              title="Clear all filters"
            >
              <FilterX className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* --- END OF IMPROVED CONTROLS --- */}

        {/* Content Area */}
        <div className="h-96 overflow-y-auto pr-2">{renderContent()}</div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
