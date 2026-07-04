// Model Context Protocol Server
const resumeParserTool = require('../tools/resumeParserTool');
const careerAnalyzerTool = require('../tools/careerAnalyzerTool');
const roadmapGeneratorTool = require('../tools/roadmapGeneratorTool');
const jobSearchTool = require('../tools/jobSearchTool');
const memoryTool = require('../tools/memoryTool');

let Server, StdioServerTransport, CallToolRequestSchema, ListToolsRequestSchema;

try {
  // Try loading from official SDK if installed
  const mcpSdk = require('@modelcontextprotocol/sdk/server/index.js');
  const mcpStdio = require('@modelcontextprotocol/sdk/server/stdio.js');
  const mcpTypes = require('@modelcontextprotocol/sdk/types.js');
  
  Server = mcpSdk.Server;
  StdioServerTransport = mcpStdio.StdioServerTransport;
  CallToolRequestSchema = mcpTypes.CallToolRequestSchema;
  ListToolsRequestSchema = mcpTypes.ListToolsRequestSchema;
} catch (e) {
  console.log('MCP SDK not pre-installed or failed to load. Using built-in JSON-RPC MCP fallback server.');
}

const TOOLS_LIST = [
  {
    name: 'resume_parser_tool',
    description: 'Parse raw resume text and extract structured profile JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        rawText: { type: 'string', description: 'Raw text extracted from resume PDF' }
      },
      required: ['rawText']
    }
  },
  {
    name: 'career_analyzer_tool',
    description: 'Compare skills profile against a target role to find gaps and priorities.',
    inputSchema: {
      type: 'object',
      properties: {
        profile: { type: 'object', description: 'User profile JSON containing skills, experience, etc.' },
        targetRole: { type: 'string', description: 'Career path or target job title' }
      },
      required: ['profile', 'targetRole']
    }
  },
  {
    name: 'roadmap_generator_tool',
    description: 'Create a personalized month-by-month learning plan from missing skills.',
    inputSchema: {
      type: 'object',
      properties: {
        missingSkills: { type: 'array', items: { type: 'object' }, description: 'Array of missing skills and priorities' },
        targetRole: { type: 'string', description: 'Target career path title' }
      },
      required: ['missingSkills', 'targetRole']
    }
  },
  {
    name: 'job_search_tool',
    description: 'Find market matching jobs based on candidate skills and role.',
    inputSchema: {
      type: 'object',
      properties: {
        skills: { type: 'array', items: { type: 'string' }, description: 'Candidate skills' },
        targetRole: { type: 'string', description: 'Target career track' }
      },
      required: ['skills', 'targetRole']
    }
  },
  {
    name: 'memory_tool',
    description: 'Get or set user metrics, completed items, and learning scores in long-term state database.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['read_profile', 'write_profile', 'read_progress', 'write_progress'], description: 'Read or write command' },
        userId: { type: 'string', description: 'MongoDB user identifier' },
        data: { type: 'object', description: 'JSON data content for write actions' }
      },
      required: ['action', 'userId']
    }
  }
];

const handleToolCall = async (name, args) => {
  switch (name) {
    case 'resume_parser_tool':
      return await resumeParserTool(args.rawText);
    case 'career_analyzer_tool':
      return await careerAnalyzerTool(args.profile, args.targetRole);
    case 'roadmap_generator_tool':
      return await roadmapGeneratorTool(args.missingSkills, args.targetRole);
    case 'job_search_tool':
      return await jobSearchTool(args.skills, args.targetRole);
    case 'memory_tool':
      const { action, userId, data } = args;
      if (action === 'read_profile') {
        const prof = await memoryTool.getCareerProfile(userId);
        const resObj = await memoryTool.getResume(userId);
        return { profile: prof, resume: resObj };
      } else if (action === 'write_profile') {
        return await memoryTool.saveCareerProfile(userId, data);
      } else if (action === 'read_progress') {
        return await memoryTool.getProgress(userId);
      } else if (action === 'write_progress') {
        return await memoryTool.saveProgress(userId, data.completedTopic, data.completedProject, data.scoreChange);
      }
      throw new Error(`Unsupported memory action: ${action}`);
    default:
      throw new Error(`Tool not found: ${name}`);
  }
};

// Start Server using SDK if available
if (Server && StdioServerTransport) {
  const server = new Server({
    name: 'skillforge-mcp-server',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS_LIST
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const content = await handleToolCall(request.params.name, request.params.arguments);
      return {
        content: [{ type: 'text', text: JSON.stringify(content, null, 2) }]
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: err.message }]
      };
    }
  });

  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.error('SkillForge MCP Server connected via Stdio Transport');
  }).catch((err) => {
    console.error('Error starting MCP Server:', err);
  });
} else {
  // Built-in JSON-RPC server running over stdio
  console.error('Starting custom JSON-RPC stdio handler...');
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', async (chunk) => {
    try {
      const lines = chunk.trim().split('\n');
      for (const line of lines) {
        if (!line) continue;
        const request = JSON.parse(line);
        
        if (request.method === 'tools/list') {
          sendResponse(request.id, { tools: TOOLS_LIST });
        } else if (request.method === 'tools/call') {
          try {
            const output = await handleToolCall(request.params.name, request.params.arguments);
            sendResponse(request.id, {
              content: [{ type: 'text', text: JSON.stringify(output) }]
            });
          } catch (e) {
            sendError(request.id, -32603, e.message);
          }
        } else {
          sendError(request.id, -32601, 'Method not found');
        }
      }
    } catch (err) {
      sendError(null, -32700, 'Parse error: ' + err.message);
    }
  });

  const sendResponse = (id, result) => {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
  };

  const sendError = (id, code, message) => {
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
  };
}

module.exports = { handleToolCall, TOOLS_LIST };
