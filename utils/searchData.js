// This function takes a search query and an array of data as input
export default function searchData(searchQuery, data) {
    // if (searchQuery == undefined {return;}
    // Create a copy of the data array to avoid modifying the original data
    let data2 = [...data];
    // Filter the data array based on the search query
    const results = data2.filter((item) => {
        // Loop through each key in the item object
        for (const key in item) {
            // Skip the "id" key
            if (key === "id") continue;

            // Get the search query and the value of the current key
            let query = searchQuery.toLowerCase();
            let value = item[key];

            // If the value is a number, check if it matches the search query
            if (typeof value === "number") {
                if (value.toString().includes(query)) {
                    return true;
                }
            // If the value is a string, check if it contains the search query
            } else if (typeof value === "string") {
                let data = value.toLowerCase();
                if (data.includes(query)) {
                    return true;
                }
            }
        }
        // If none of the keys match the search query, exclude the item from the results
        return false;
    });
    // Return the filtered results
    return results;
}