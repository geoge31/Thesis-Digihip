
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; 
import styles from "./SearchInput.module.css"; 


interface SchIptProps {
    onSearch: (query: string) => void;
    place_holder: string;
}

const SearchInput: React.FC<SchIptProps> = ({ onSearch, place_holder}) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Call the search function
  };

  const clearSearch = () => {
    setQuery("");
    onSearch(""); // Clear the search results
  };


  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        value={query}
        onChange={handleInputChange}
        placeholder={place_holder}
      />
        <div 
            className={styles.clrBtn}
            onClick={clearSearch}
        >
            <FaTimes title="Εκκαθάριση"/>
        </div>
    </div>
  );
};

export default SearchInput;
