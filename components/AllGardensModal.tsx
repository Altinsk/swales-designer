"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Modal from "./Modal";
import {
  Search,
  ImageIcon,
  Trash2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  FilterX,
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
  const { user } = useAuth();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchAllGardens = async () => {
    if (!user) return;
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
        withCredentials: true,
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
  }, [isOpen, currentPage, debouncedSearchTerm, sortBy, dateRange, user]);

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
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 text-[#737373] animate-spin" />
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-red-500 p-8">{error}</p>;
    }
    if (projects.length === 0) {
      return (
        <p className="text-center text-[#737373] p-8">
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
                className="w-16 h-12 object-cover rounded-md mr-4 bg-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-12 flex items-center justify-center bg-gray-100 rounded-md mr-4 flex-shrink-0">
                <ImageIcon className="w-6 h-6 text-[#a3a3a3]" />
              </div>
            )}
            <div className="flex-grow text-left min-w-0">
              <p className="font-semibold truncate">{garden.Name}</p>
              <p className="text-xs text-[#737373]">
                Updated: {new Date(garden.DateLastUpdated).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => handleLocalDelete(e, garden.ProjectId)}
              className="p-1 rounded-full text-[#a3a3a3] hover:bg-red-100 hover:text-red-600 ml-2 flex-shrink-0"
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Garden Plans"
      modalClassName="w-full max-w-4xl h-[90%] max-h-[700px]"
    >
      <div className="p-2 sm:p-4 flex flex-col h-full gap-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto lg:flex-grow">
            <div className="relative w-full md:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
              <input
                type="text"
                placeholder="Search gardens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="date_desc">Sort: Newest</option>
              <option value="date_asc">Sort: Oldest</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="name_desc">Sort: Name (Z-A)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  setDateRange({ ...dateRange, from: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-[#737373]"
                title="Filter by start date"
              />
              <span className="text-[#a3a3a3] hidden sm:block">-</span>
              <input
                type="date"
                value={dateRange.to}
                min={dateRange.from || undefined}
                onChange={(e) => {
                  setDateRange({ ...dateRange, to: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm text-[#737373]"
                title="Filter by end date"
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="p-2 text-[#737373] bg-gray-200 hover:bg-gray-300 rounded-md self-end sm:self-center"
              title="Clear all filters"
            >
              <FilterX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 min-h-0">
          {renderContent()}
        </div>

        {totalPages > 1 && !isLoading && (
          <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-lg flex items-center gap-1 disabled:opacity-50"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <span className="text-sm text-[#525252]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-lg flex items-center gap-1 disabled:opacity-50"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
