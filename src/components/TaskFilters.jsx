    function TaskFilters({ searchQuery, setSearchQuery, filterCategory, setFilterCategory }) {
    const categories = ["All", "Work", "Personal", "Urgent"];

    return (
        <div className="filters-container">
        <input 
            type="text" 
            className="search-bar" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="category-tabs">
            {categories.map(cat => (
            <button 
                key={cat} 
                className={`tab-btn ${filterCategory === cat ? 'active-tab' : ''}`}
                onClick={() => setFilterCategory(cat)}
            >
                {cat}
            </button>
            ))}
        </div>
        </div>
    );
    }

    export default TaskFilters;