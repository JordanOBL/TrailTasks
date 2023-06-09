const searchFilterFunction = <T>(
  text: string,
  masterDataSource: T[],
  setFilteredDataSource: React.Dispatch<React.SetStateAction<T[]>>,
  setSearchCallback: React.Dispatch<React.SetStateAction<string>>,
  keyToQuery: keyof T,
  debounceTime: number = 300 // Default debounce time in milliseconds
) => {
  let timeoutId: NodeJS.Timeout | null = null;

  // Function to execute the search logic
  const executeSearch = (searchText: string) => {
    // Filter the masterDataSource
    const newData = masterDataSource.filter(function (item) {
      const itemData = (item[keyToQuery] as unknown as string).toUpperCase();
      const textData = searchText.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredDataSource(newData);
    setSearchCallback(searchText);
  };

  // Debounce the search logic
  const debounceSearch = (searchText: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      executeSearch(searchText);
    }, debounceTime);
  };

  // Check if searched text is not blank
  if (text) {
    // Inserted text is not blank
    // Debounce the search
    debounceSearch(text);
  } else {
    // Inserted text is blank
    // Update FilteredDataSource with masterDataSource
    setFilteredDataSource(masterDataSource);
    setSearchCallback(text);
  }
};

export default searchFilterFunction