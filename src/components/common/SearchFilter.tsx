import React from 'react';
import { getCategoryColorClass, getActiveCategoryColorClass } from '../../design/categoryColors';

interface SearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: string[];
    placeholder?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
    searchQuery,
    onSearchChange,
    activeTab,
    onTabChange,
    tabs,
    placeholder = '검색어를 입력해주세요.',
}) => {
    return (
        <div className="flex flex-col gap-md lg:flex-row lg:items-center w-full">
            {/* Search Bar */}
            <div className="flex items-center bg-surface rounded-lg border border-border px-sm py-xs flex-1 max-w-[400px]">
                <span className="material-icons-round text-text-secondary mr-sm">search</span>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-md text-text-primary placeholder:text-text-secondary"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
                {tabs.map(tab => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${isActive
                                ? getActiveCategoryColorClass(tab)
                                : getCategoryColorClass(tab)
                                }`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
