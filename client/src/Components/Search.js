const Search = () => {
  return (
    <>
      <form className="d-flex mb-5">
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search"
          aria-label="Search"
        />
        <button
          className="btn btn-outline-primary bg-primary text-dark"
          type="submit"
        >
          Search
        </button>
      </form>
    </>
  );
};

export default Search;
