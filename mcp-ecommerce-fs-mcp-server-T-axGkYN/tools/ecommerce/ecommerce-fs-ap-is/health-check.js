/**
 * Function to perform a health check on the ecommerce API.
 *
 * @returns {Promise<Object>} - The result of the health check.
 */
const executeFunction = async () => {
  const baseUrl = process.env.BASE_URL || '';
  const accessToken = process.env.ECOMMERCE_FS_MCP_SERVER_REQUEST_HEALTH_CHECK_1PRW2XHI_ACCESSTOKEN

  // Validate BASE_URL is set
  if (!baseUrl) {
    return {
      error: 'BASE_URL environment variable is not set. Please configure it in the .env file.'
    };
  }

  try {
    // Construct the URL for the health check
    const url = `${baseUrl}/health`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json'
    };

    // If an access token is provided, add it to the Authorization header
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Perform the fetch request
    const response = await fetch(url, {
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
    console.error('Error performing health check:', error);
    return {
      error: `An error occurred while performing the health check: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for performing a health check on the ecommerce API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'health_check',
      description: 'Perform a health check on the ecommerce API.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
};

export { apiTool };