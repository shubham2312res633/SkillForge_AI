const { handleToolCall } = require('./server');

const callTool = async (toolName, toolArgs) => {
  try {
    console.log(`[MCP CLIENT] Requesting tool: ${toolName} with args:`, JSON.stringify(toolArgs));
    const result = await handleToolCall(toolName, toolArgs);
    
    // Format the response precisely in compliance with the MCP standard schema
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result)
        }
      ]
    };
  } catch (error) {
    console.error(`[MCP CLIENT] Error calling tool ${toolName}:`, error);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: error.message
        }
      ]
    };
  }
};

module.exports = {
  callTool
};
