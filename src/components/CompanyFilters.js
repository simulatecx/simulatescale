// src/components/CompanyFilters.js

const CompanyFilters = ({ onSearch, onSort }) => {
  return (
    <div className="filters-container">
      <input
        type="text"
        placeholder="Search by company name..."
        onChange={(e) => onSearch(e.target.value)}
        className="search-input"
      />
      <select onChange={(e) => onSort(e.target.value)} className="sort-dropdown">
        <option value="name-asc">Sort by Name (A-Z)</option>
        <option value="score-desc">Sort by Vendor Score (High to Low)</option>
        <option value="discount-desc">Sort by Discount (High to Low)</option>
      </select>
    </div>
  );
};

export default CompanyFilters;