/**
 * Function to get the API root of the eCommerce service.
 *
 * @returns {Promise<Object>} - The response from the API root.
 */
const executeFunction = async () => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_API_ROOT_C1_5DGF9_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching API root:', error);
    return {
      error: `An error occurred while fetching the API root: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for getting the API root of the eCommerce service.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_api_root',
      description: 'Fetch the API root of the eCommerce service.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
};

export { apiTool };