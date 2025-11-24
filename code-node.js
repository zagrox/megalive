// IMPORTANT: This code should be pasted into the "Code" node in your N8N workflow.
// This file acts as a source of truth for that node's code.

// 1. Get chatbot data from your "Edit Fields1" node.
const chatbotData = $('Edit Fields1').item.json;
const workflowTemplate = $('Get n8n Workflow').item.json;

// 2. Get the pre-generated UUID from the "Edit Fields1" node.
const chatbotTriggerId = chatbotData.chatbotTrigger;

// 3. Build a clean workflow object from the template.
const cleanWorkflow = {
  name: `Chatbot - ${chatbotData.chatbotSlug}`,
  nodes: [],
  connections: workflowTemplate.connections || {},
  settings: workflowTemplate.settings || {},
};

// 4. Clean and update each node from the template.
for (const templateNode of workflowTemplate.nodes) {
  const cleanNode = {
    type: templateNode.type,
    typeVersion: templateNode.typeVersion,
    position: templateNode.position,
    name: templateNode.name,
    parameters: JSON.parse(JSON.stringify(templateNode.parameters || {})), // Deep copy
    // FIX: Add credentials property if it exists on the template node to prevent them from being stripped out.
    // This resolves the "Credentials not set" error in the generated workflows.
    ...(templateNode.credentials && { credentials: JSON.parse(JSON.stringify(templateNode.credentials)) }),
  };

  // --- Apply specific updates for this new chatbot ---

  // A. Set our pre-generated UUID on the Chat Trigger node.
  // The 'webhookId' property must be at the root level of the node object, NOT inside 'parameters'.
  if (cleanNode.type === '@n8n/n8n-nodes-langchain.chatTrigger') {
    cleanNode.webhookId = chatbotTriggerId;
  }
  
  // B. Update the standard Webhook Trigger node with the unique slug.
  if (cleanNode.type === 'n8n-nodes-base.webhook') {
    cleanNode.parameters.path = chatbotData.chatbotSlug;
  }

  // C. Update the "Qdrant Vector Store" node.
  if (cleanNode.name === 'Qdrant Vector Store' && cleanNode.type === '@n8n/n8n-nodes-langchain.vectorStoreQdrant') {
    if (cleanNode.parameters.qdrantCollection) {
      cleanNode.parameters.qdrantCollection.value = chatbotData.chatbotSlug;
      cleanNode.parameters.qdrantCollection.mode = 'value';
      delete cleanNode.parameters.qdrantCollection.__rl;
    }
    cleanNode.parameters.toolDescription = chatbotData.chatbotQtool;
  }
  
  // D. Update the "AI Agent" node with the main system prompt.
  if (cleanNode.name === 'AI Agent' && cleanNode.type === '@n8n/n8n-nodes-langchain.agent') {
    if (!cleanNode.parameters.options) {
      cleanNode.parameters.options = {};
    }
    cleanNode.parameters.options.systemMessage = chatbotData.chatbotPrompt;
  }


  // E. Overwrite the "Edit Fields1" (Set) node to inject this chatbot's specific static data.
  // We find the node by its name 'Edit Fields1' from the template.
  if (cleanNode.name === 'Edit Fields1' && cleanNode.type === 'n8n-nodes-base.set') {
    cleanNode.parameters = {
        assignments: {
            assignments: [
                { name: 'chatbotName', value: chatbotData.chatbotName, type: 'string' },
                { name: 'chatbotSlug', value: chatbotData.chatbotSlug, type: 'string' },
                { name: 'chatbotPrompt', value: chatbotData.chatbotPrompt, type: 'string' },
                { name: 'chatbotBusiness', value: chatbotData.chatbotBusiness, type: 'string' },
                { name: 'chatbotId', value: chatbotData.chatbotId, type: 'number' },
                {
                    name: 'chatbotQtool',
                    value: `Use this tool to find and retrieve definitive information about ${chatbotData.chatbotBusiness}. It is the primary source for answering user questions on topics including: services, product features, user general inquiries, helpful contents, technical specifications. Prioritize using this tool whenever the user's question is about ${chatbotData.chatbotBusiness}.`,
                    type: 'string'
                },
                { name: 'chatInput', value: '={{ $json.chatInput }}', type: 'string' },
                { name: 'sessionId', value: '={{ $json.sessionId }}', type: 'string' },
                { name: 'chatbotTrigger', value: chatbotTriggerId, type: 'string' },
            ]
        },
        options: {
            mode: 'keep'
        }
    };
  }

  // F. Add the fully cleaned and updated node to our new workflow.
  cleanWorkflow.nodes.push(cleanNode);
}


// 5. Return the data needed for the next steps.
// - workflowBody is for the "Create Workflow" node.
// - webhookId and chatbotId are for the "Update Directus" node.
return {
  json: {
    workflowBody: cleanWorkflow,
    webhookId: chatbotTriggerId, // Pass the ID through for the update step.
    chatbotId: chatbotData.chatbotId
  }
};