# Agent
## Agent Overview
### What is an Agent?
The term **"Agent"** can have multiple definitions. Some people define an Agent as a fully autonomous system capable of operating independently over extended periods of time, using various tools to accomplish complex tasks. Others use the term to describe a more structured implementation that follows predefined workflows.

**Components of an Agent**  
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig1.png)

Source: https://www.bilibili.com/video/BV1uNk1YxEJQ?spm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8

From an engineering perspective, an Agent can be decomposed into four core modules: **Reasoning, Memory, Tools, and Action**.

### Complete Agent Workflow
We believe that a simple LLM (Prompt) alone should not be considered an Agent. The fundamental building block of an Agent system is an LLM enhanced with capabilities such as retrieval, tools, and memory. Modern models can proactively leverage these capabilities to generate their own search queries, select appropriate tools, and determine which information should be retained.

🧩🧩🧩

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig2.png)

The focus of an Agent is not the model itself, but enabling the model to truly accomplish tasks.

🧩🧩🧩🧩

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig3.png)

Agent Decision-Making Workflow

Source: https://www.bilibili.com/video/BV1uNk1YxEJQ?spm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8

**Perception:** The Agent first receives input from the external environment. It needs to understand what the user is asking before passing the information to the LLM.

**Planning:** The LLM decomposes the task into smaller subtasks in order to solve the problem more effectively.

**Subtask decomposition principles:** Subtasks should be as independent as possible, with each task corresponding to a single Tool. This design facilitates engineering implementation, and each step should produce a clearly defined output. If the decomposition granularity is too coarse, reliability decreases; if it is too fine, reasoning cost and contextual complexity increase. Therefore, in engineering practice, each step is typically designed to correspond to a clear objective with a verifiable output.

**Action:** Execute the current subtask and obtain feedback.

**Observation:** The Agent does not initially know whether the feedback is good or bad, so it reflects on the result. If the outcome is satisfactory, it proceeds to plan the next task; otherwise, it reevaluates whether the next planning step should be revised.

### The Role of LLMs in the Agent Framework
Within the overall framework, the LLM serves as the brain responsible for reasoning and decision-making. However, it cannot directly interact with the external world or communicate directly with users. Without a Runtime, even if the model knows what to do, it lacks an execution environment—like a person placed in a void, unable to accomplish any real task.

**How an LLM Responds:**

Fundamentally, there is only one response pattern for an LLM:

> Reason  
> Act (invoke tools if necessary)  
> Observation  
> Final Answer

The only difference is that:

Some questions do not require access to the external environment, for example:

> Hi, how are you?

In such cases, the LLM can answer directly using its existing knowledge.

More often, however, the LLM realizes that it lacks necessary information or needs to perform certain operations, so it asks the Runtime to invoke the appropriate Tool. These tools are not limited to APIs—they may also include MCP, databases, RAG retrieval systems, search engines, local code executors, or even other Agents.

Therefore, it is inaccurate to think of this as "two different answering methods." Instead, it should be understood as:

The model always completes the required task first and then generates the final answer. Some tasks simply do not require tool invocation.

It is also important to note that LLMs generally struggle to explicitly admit:

```text
This question cannot be solved.
I couldn't find the answer.
I'm not sure.
```

When a problem genuinely cannot be solved, unless explicit constraints are imposed, the model often does not stop automatically. Instead, it continues searching, planning, and may even begin hallucinating—producing answers that appear reasonable but are actually incorrect.

Therefore, in practical engineering, the Runtime usually imposes upper limits on the number of Agent iterations, Tool Calls, or Planning steps.

An LLM (Prompt) without a Runtime should not be regarded as an Agent. The Runtime is what fundamentally enables an Agent to function as an engineering system.

## Agent Runtime
### What is Runtime?
A Runtime is essentially the execution infrastructure of an AI Agent. It manages the Agent's lifecycle, state, computational resources, and interactions with external systems, ensuring that the Agent can operate reliably, securely, and at scale. It provides the infrastructure or platform that enables an Agent to run, process inputs, execute tasks, and deliver outputs in real time or near real time.

> Responsibilities:
>
> Maintain State and Session;  
> Manage Memory;  
> Invoke Tools;  
> Control workflows;  
> Handle permissions and exceptions;  
> Organize Context;  
> Interact with the external environment.

🧩🧩🧩

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig4.png)

Typical Runtime

When the LLM determines that a tool is required, it passes the Tool Call request to the Runtime, which then invokes the corresponding MCP Server through the MCP Client.

However, one important component is missing from this process:

> "Does the library have Harry Potter?"  
> "Where can I find this book?"  
> Which specific book does "this book" refer to?

**State:** Hidden behind this process is a concept called **State**. State stores the information that an Agent must continuously maintain while executing tasks, such as whether the user has logged in, user permissions, conversation history, current task progress, previously invoked tools, tool outputs, and business-related data (e.g., whether a book has already been borrowed or whether there are outstanding fines). This information is not lost after a single model invocation but is maintained consistently by the Runtime.

When the user submits a new request, the Runtime selects the information from the current State that is relevant to the current task and provides it to the LLM, helping the model understand the context and determine which Tool or API should be called next. For example, when a user says, "Help me renew this book," the LLM itself does not know which book "this book" refers to. Instead, the Runtime retrieves the borrowing records and conversation history stored in the State, provides the relevant information to the LLM, and enables the model to correctly invoke the corresponding renewal API.

Regarding the *Runtime's selection* mentioned above: the Runtime itself does not perform autonomous reasoning. It organizes task-related State according to predefined rules or workflows established by the developer. It is the LLM—not the Runtime—that actually understands and interprets the information.

### Context
The LLM does not consider only the current user message in each interaction. Instead, it simultaneously receives the system prompt, tool list, conversation history, session/user state, permission status, retrieval results, and the current user input. The Runtime is responsible for organizing all of this information into a controlled execution flow.

**Context** refers to the complete set of information received by the LLM each time it processes a task. It includes conversation history, user queries, current outputs, available tools, the system prompt, and other relevant information. It can be regarded as the LLM's temporary working memory.

The **context window** of a model represents the maximum number of tokens that the model can process during a single interaction.

The size of the Context and the number of tokens it contains are both constrained by the context window.

🧩🧩🧩

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig5.png)

Note that the **Context Window is not the same as Memory**.

## **Types of Memory in AI Agents**

**Memory:** Memory can be divided into **short-term memory** and **long-term memory**.

**Memory Formation:** Large language models are pre-trained on massive datasets containing world knowledge. During pre-training, the model learns to understand and generate human language by adjusting the weights of its neural network. This process is regarded as the formation of "memory." Through techniques such as deep learning and gradient descent, the model continuously improves its ability to predict and generate text, thereby forming long-term memory. This knowledge is stored in the model's parameters and does not disappear unless the model is retrained or fine-tuned.

**Short-Term Memory / Working Memory**

Short-term memory (STM) is the mechanism that enables an Agent to maintain the immediate context of the current conversation and task. It mainly includes:

- **Conversation (Context) Memory:** Maintains a rolling window of recent conversation history to ensure contextual consistency in responses.
- **Working Memory:** Stores temporary information required for the current task, such as intermediate results and variable values.

Short-term memory is limited by the size of the context window and is suitable for simple conversations and single-task scenarios.

**Long-Term Memory**

Long-term memory (LTM) is the form of memory that enables an Agent to preserve knowledge across multiple conversations and tasks over an extended period. It corresponds to the persistent memory in the human brain, such as factual knowledge and past experiences. Long-term memory is typically implemented using external storage or knowledge bases, including but not limited to:

- **Summarized Memory:** Stores concise summaries extracted from long conversations.
- **Structured Knowledge Base:** Stores structured information using databases or knowledge graphs.
- **Vector-Based Storage:** Uses vector databases to enable semantic memory retrieval.

Long-term memory allows an Agent to accumulate knowledge and experience over time, making it particularly suitable for knowledge-intensive applications and long-term personalized interactions.

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig6.png)

---

### Session, State, and Memory in Conversation Memory

Common approaches for managing conversational context include:

**Session:** Represents the current conversation thread, i.e., an ongoing interaction between the user and the Agent system. It contains a chronological record of user messages and the operations (called **Events**) performed by the Agent during that interaction. A Session can also store temporary data that is valid only for the current conversation (**SessionState**).

**State (session.state):** Represents the data associated with the current conversation. It is stored within a specific Session and is used to manage information relevant only to the active conversation, such as the shopping cart contents during the current chat or user preferences mentioned in this session.

**Memory:** Represents a storage system that may span multiple historical Sessions or incorporate information from external data sources. It serves as a knowledge base that the Agent can search to recall information or retrieve context beyond the current conversation.

In addition to Chat APIs that manage memory automatically, there is another Session-based API pattern. For example, the Completion API does not send the conversation context; it only sends the current input and a session ID, while the server maintains the session history. Both Gemini and Claude support these two approaches. The client only needs to send the current input and the `session_id`, while the conversation history is maintained by the server, relieving developers from manually managing the conversation history.

It is important to note that both Chat APIs and traditional Completion APIs are fundamentally **stateless**. Both can include historical information or send only the current input. The primary difference lies in the input format and the way context is managed, rather than whether the model itself possesses memory.

Essentially, both approaches are implementations of **Conversation Memory**, and both are designed to solve the problem of short-term contextual memory.

*Conversational Context: Session, State, and Memory - Agent Development Kit (ADK)*

**Summarized Memory:** While short-term memory ensures conversational continuity, it does not scale well. As conversations become longer, replaying every message becomes increasingly inefficient and unreliable. Summarized memory addresses this problem.

It captures:

> User intent  
> Important facts  
> Decisions and constraints

It explicitly does **not** store:

> Every individual message  
> Casual conversation  
> Redundant confirmations

https://medium.com/@sitaramireddy1994/summarized-memory-in-ai-agents-compressing-conversation-without-losing-intent-c0cf7678071c

## **Sources of Agent Capabilities (Tools)**

### Tool

**Tools:** An LLM has no inherent ability to interact with the external environment. Without environmental interaction, it cannot perform any real-world actions. Tools are therefore considered part of the environment. They enable the model to obtain external information that is not contained within its pretrained parameters, typically through APIs. This is especially important because the knowledge stored in pretrained model weights is difficult to modify after training.

The availability of Tools and the permissions to use them are defined by the developer, while the decision of whether to invoke a particular Tool is made dynamically by the LLM within the Runtime according to the current task. Prompt engineering can activate or guide the model's existing capabilities, but these capabilities remain fundamentally constrained by the model's pretrained weights. Some models naturally possess stronger capabilities, whereas others may still perform poorly even with carefully designed prompts.

🧩🧩🧩

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig7.png)

Tools define the capability boundary of an Agent. The Runtime is responsible for managing and orchestrating Tools, while the Tools themselves usually exist as independent components outside the Runtime (e.g., local functions, APIs, or MCP Servers). An LLM cannot invent new Tools on its own, nor can it automatically discover new Tools over the Internet. An Agent only possesses the capabilities provided by the Tools that developers have pre-integrated and registered with the Runtime.

For example, even if a banking Agent knows how to order food delivery, it cannot complete the task if the Runtime has not integrated any food-ordering Tool.

### MCP

Even with the most advanced models, their effectiveness is significantly limited if they cannot connect to the external world to obtain the necessary data and context.

**The LLM is responsible for deciding whether to invoke a tool, the Runtime is responsible for invoking the tool, and MCP is responsible for providing a standardized communication protocol for tools.**

- **Model Context Protocol (MCP)** is an open protocol that standardizes how AI applications connect to external tools and data sources. It can be understood as a unified tool integration standard (similar to how modern smartphones use the USB Type-C interface). MCP itself is not a Tool but a communication protocol used by the Runtime. Unlike ordinary tools, an MCP Server encapsulates tools as standardized black-box services. The MCP ecosystem enables LLM Agents to access hundreds of tools for solving real-world tasks. One of the greatest advantages of MCP Servers is their high reusability across different applications and Runtime implementations.

- The purpose of MCP is to standardize the way AI applications connect to external tools and data sources. As long as an Agent application implements an MCP Client and the underlying model supports (or can be adapted to support) tool calling, the same set of MCP Servers can be reused without rewriting tool integration logic for every model.

> **Can tools bound directly to a LangGraph model eliminate the need for MCP when switching models?**

Yes, but the switch cannot be completely modification-free. For example, suppose we define a set of standard tools in LangGraph:

```python
tools = [search_tool, database_tool, calculator_tool]
```

Then bind them to the model:

```python
model_with_tools = model.bind_tools(tools)
```

In theory, the model can be switched from OpenAI to another tool-calling model such as Qwen. LangChain tools are essentially callable functions with well-defined input and output schemas, which are passed to the chat model so that it can decide when to invoke them.

> However, the following points should be noted:

- The new model must support tool calling.
- Different models do not provide identical tool-calling capabilities.
- A standard LangGraph Tool is **not** the same as an MCP Tool.

**The advantage of binding tools directly to LangGraph is its simplicity, making it suitable for standalone projects. When switching models, the LangGraph workflow and tools can usually be reused, although the model adapter must still be replaced and the new model must be verified to support tool calling.**

**Using MCP further decouples the tool layer from the model layer, but it does not guarantee completely modification-free model switching.**

- From an engineering perspective, an MCP Server can essentially be regarded as a **wrapper** that encapsulates APIs, databases, RAG systems, search engines, and other capabilities behind a standardized interface that can be invoked by the Runtime.

- However, MCP is also a relatively "heavyweight" solution. Since every capability must be packaged according to the MCP specification, it is similar to carrying an entire toolbox. For large-scale systems, complex Agents, and multi-model environments, this standardization provides tremendous scalability. However, for simply invoking a single tool, directly calling an API is often much lighter and may not require introducing the entire MCP ecosystem.

### Tool Calling

- Many tools can be packaged as MCP Server interfaces that are accessed through an MCP Client. Why package them as MCP Servers instead of connecting directly to the APIs? This is mainly an engineering consideration. Models change frequently—for example, today's application may use GPT, while tomorrow's may switch to Qwen. Their native interfaces differ, requiring integration code to be rewritten. By wrapping tools as MCP Servers, different models only need to support the MCP interface. Although each model may have its own internal format, they can all communicate through MCP, allowing model replacement without modifying the underlying tool integrations.

- An MCP Client only knows that a particular tool is needed; it does not know how the tool itself works. Its responsibility is simply to invoke the corresponding MCP Server. This is where frameworks such as LangGraph become valuable. Permission control should **not** be left to the LLM because hallucinations may lead to incorrect decisions. Instead, a permission verification step can be inserted before the tool call. Once the Agent Runtime completes the authorization check, it can safely invoke the MCP Client.

- An MCP Server can be understood as a server that packages external tools, databases, file systems, search services, or business APIs into a unified protocol. The MCP Client, running inside the Agent Runtime, is responsible for discovering tools, reading their descriptions, invoking them, and receiving their results. As a result, changes to the underlying model or upper-level framework do not require rewriting all tool integrations.

The actual business logic still resides behind the MCP Server in APIs, databases, or backend services. The Agent Runtime interacts with them only through standardized protocol interfaces.

In practice, directly binding Tools in LangGraph is more common than using MCP.

### Skill

- A **Skill** can be understood as an **on-demand loaded task instruction manual**. It is not a new Tool, but rather a package containing the knowledge, workflow, and Tool usage required to accomplish a specific category of tasks.

- In traditional Tool Calling, the Runtime typically provides the LLM with the names, descriptions, and invocation methods of all available Tools in advance, allowing the model to determine which Tool to call. When the number of Tools becomes large, these descriptions consume a significant portion of the available context, increase Prompt length, and reduce reasoning efficiency.

- The core idea behind Skills is **on-demand loading**. Instead of providing the model with every task description and tool specification at startup, the Runtime loads only the Skill corresponding to the user's current task. For example, when a user wants to analyze an Excel file, the Runtime loads the **Excel Analysis Skill** instead of simultaneously loading Skills related to GitHub, databases, or browsers.

- A Skill can be regarded as a compressed **Instruction Manual**. Although an LLM may already possess the fundamental ability to complete a task, different Runtime environments or enterprise systems often have their own workflows, conventions, and preferred ways of using tools. Without this instruction manual, the model has no knowledge of the recommended workflow, which Tools should be prioritized, or how each step should be organized. The role of a Skill is therefore to provide this additional guidance at the beginning of the task so that the model can complete the task according to the Runtime's conventions.

> A Skill typically contains:

- The objective and applicable scenarios of the current task;
- The recommended execution workflow;
- Best practices and constraints;
- The Tools or scripts required for the task, together with instructions for using them.

It is important to note that a Skill **does not execute tasks** and **does not provide Tools**. Instead, it acts as a **user guide**, telling the model:

> "To complete this task, these are the recommended steps, and these are the Tools that should be invoked."

The actual execution is still performed by the Tools provided by the Runtime (either local Tools or Tools exposed through MCP Servers).

**Relationship between Skill, MCP, and LLM**

- Skill, LLM, and MCP each belong to different layers of an Agent architecture. The LLM is responsible for understanding tasks and making reasoning decisions. A Skill is an on-demand loaded task guide that provides workflows, best practices, and recommended Tools for completing a particular category of tasks. MCP is a standardized communication protocol that enables the Runtime to connect to and invoke external Tools in a consistent manner. Skills do not execute tasks, and MCP does not guide task execution. Together, they help the LLM complete complex tasks more efficiently and in a more standardized way.

- Skill and MCP may coexist, but they are independent of each other. An Agent may use both Skill and MCP, or it may use only one of them.

> A Skill serves as a **guide**. Without it, the LLM can still complete tasks, although it may lack standardized workflows and best practices.

> MCP serves as a **connector**. Without it, the Runtime can still invoke local functions, SDKs, or APIs as Tools. However, those Tools usually need to be adapted separately for different Runtime environments or Agent frameworks. When the same set of Tools needs to be shared across multiple Runtimes (such as LangGraph, Claude Desktop, Cursor, or the OpenAI Agents SDK), developers may otherwise need to repeatedly develop and maintain different integration interfaces. MCP solves this problem by encapsulating Tools as standardized MCP Servers, allowing multiple Runtimes to reuse the same Tool implementations without rewriting the integration logic for every platform.

---

## RAG

**Retrieval-Augmented Generation (RAG)** is a technique that enhances the output of a Large Language Model by allowing it to reference authoritative knowledge sources beyond its training data before generating a response. Large Language Models (LLMs) are trained on massive datasets containing billions of parameters to perform tasks such as question answering, translation, and text completion. Building upon these capabilities, RAG extends the model by enabling access to domain-specific or organization-specific knowledge bases without requiring retraining. It provides a cost-effective way to improve the relevance, accuracy, and usefulness of LLM-generated responses across a wide variety of scenarios.

### RAG Workflow

🧩🧩🧩🧩

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig8.png)

A complete RAG pipeline typically consists of the following stages: **document preprocessing and chunking, embedding generation, query rewriting or expansion, retrieval, reranking, context compression, source citation preservation, LLM generation, and answer validation.**

Before introducing RAG, an LLM's knowledge is limited to its training data. After introducing RAG, the system first retrieves relevant external information, then supplies that information to the LLM. The model itself remains unchanged, but the Prompt becomes enriched with retrieved context.

### Chunking

Chunking refers to splitting long documents into smaller segments before storing them in a vector database.

- If the chunks are too small (e.g., 100 tokens), important context may be lost. For example, one chunk may say, "This method is applicable to the above scenario," while the actual "above scenario" appears in the previous chunk. Even if retrieved, the LLM cannot understand the reference.

- If the chunks are too large (e.g., 2000 tokens), the context remains complete, but the semantic representation becomes diluted by irrelevant information, reducing retrieval accuracy.

There is no universally optimal chunk size. It should be adjusted according to the document type and task. General documents typically use chunk sizes of approximately **300–800 tokens**. Code and tables are usually split according to their structure. Titles, section headings, and metadata should also be preserved whenever possible.

Overlap is often introduced to prevent important information from being split across chunk boundaries. A common overlap ratio is **10%–20%**.

### Embedding

In RAG, the **Embedding** model is usually a separate model that functions as a semantic indexing tool. It converts documents into vectors, which are then stored in a vector database.

> Example:
>
> Suppose you have a document:
>
> *"Harry Potter is a fantasy novel."*
>
> The embedding model converts the document into a vector and stores it in the vector database.
>
> When a user asks:
>
> *"Where can I find Harry Potter?"*
>
> the query is also converted into a vector.
>
> The system compares the similarity between:
>
> **User query vector vs. Document chunk vector**
>
> If the distance between them is sufficiently small, they are considered semantically related. The corresponding document chunk is retrieved and passed to the LLM for answer generation.

Choosing an embedding model depends on the language, domain, and benchmark performance. For Chinese applications, models such as **BGE**, **M3E**, **E5**, and the **text-embedding** series are common choices. Higher embedding dimensions are not necessarily better—they increase storage and retrieval costs. For domain-specific applications, embedding fine-tuning or hybrid retrieval can also be considered.

### Retrieval

When the system receives a query, it does **not** immediately ask the LLM. Instead, it first searches the relevant knowledge base and retrieves semantically related content to augment the context before passing it to the model.

### Reranking

Retrieval often returns many candidate documents, but only a small subset should be provided to the LLM. The challenge is how to reliably select the most relevant results and prevent the LLM from hallucinating when no suitable information exists.

Retrieval aims to maximize recall by retrieving as many potentially relevant documents as possible, whereas **Reranking** selects the most appropriate document chunks to include in the context. Their objectives differ:

- **Retrieval:** Prioritizes high recall, even if more candidate documents are returned.
- **Reranking:** Optimizes quality while controlling token consumption by selecting only the most relevant results.