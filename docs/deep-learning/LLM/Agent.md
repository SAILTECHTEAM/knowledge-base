# Agent

## Overall Agent Pipeline

### What is an Agent

The term "Agent" can have multiple definitions. Some people define an Agent as a fully autonomous system that can operate independently over a long period of time and use various tools to complete complex tasks. Others use the term to describe a more structured implementation that follows predefined workflows.

**Components of an Agent**

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig1.png" width="70%">

</div>

Image source: https://www.bilibili.com/video/BV1uNk1YxEJQspm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8


From an engineering perspective, an Agent can be divided into four core modules:

- Reasoning
- Memory
- Tools
- Actions

### Complete Workflow of an Agent

An Agent is a software system that can perceive the environment, perform reasoning and decision-making, call tools, and continuously complete tasks based on feedback. LLMs usually serve as the reasoning core of an Agent, but an Agent is not equivalent to an LLM.

A simple LLM with only prompts cannot be considered an Agent. The fundamental building block of an Agent system is an LLM enhanced with additional capabilities such as retrieval, tools, and memory. Modern models can actively utilize these capabilities, generate their own search queries, select appropriate tools, and determine what information should be retained.

🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig2.png" width="70%">

</div>

The focus of an Agent is not the model itself, but enabling the model to truly possess the ability to complete tasks.

🧩🧩🧩🧩

<div align="center">
<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig3.png" width="70%">
</div>

Agent Decision-Making Process

Image source: https://www.bilibili.com/video/BV1uNk1YxEJQspm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8


**Perception:**  
The Agent needs to receive input from the external environment and understand what the user is asking. After perception, the information is passed to the LLM.

**Planning:**  
The Agent uses the planning capability of the LLM to decompose the task and solve the problem more effectively.

Regarding the principles of subtask decomposition: subtasks should be as independent as possible. Each task should correspond to a specific Tool, which improves engineering implementation, and each step should have a clear output.

If the decomposition granularity is too coarse, the reliability of the Agent may decrease. If it is too fine, reasoning costs and context complexity will increase. Therefore, in engineering practice, each step should ideally correspond to a clear objective and a verifiable output.

**Action:**  
The Agent solves the current subtask and obtains feedback.

**Observation:**  
However, the Agent does not initially know whether the feedback is good or bad, so it needs to perform reflection. If the result is good, it continues planning the next task. If the result is unsatisfactory, it considers whether the next planning step needs to be redesigned.

### The Role of LLM in the Agent Framework

Within the entire framework, the LLM functions more like the brain responsible for reasoning and decision-making. However, it cannot directly interact with the external world or directly serve users by itself.

Without a Runtime, even if the model knows what should be done, there is no execution environment available. It is like a person placed in an empty space, unable to actually complete any task.

**How LLM Generates Responses:**

The LLM itself is only responsible for generating outputs based on inputs. In an Agent framework, the Runtime constructs an execution loop. A common execution pattern is the ReAct (Reasoning-Acting) loop:

> Reason  
> Call a Tool if necessary (Act)  
> Obtain results (Observation)  
> Generate the final answer (Final Answer)

The difference is only that:

Some questions do not require access to the external environment, for example:

> Hi, how are you?

The LLM can directly generate an answer based on its existing knowledge.

More often, the LLM will recognize that it lacks necessary information or needs to perform certain operations, and therefore request the Runtime to call the corresponding Tool.

Tools are not limited to APIs. They can also include MCP, databases, RAG retrieval systems, search engines, local code execution environments, or even other Agents.

Therefore, we should not simply understand this as having "two different response modes". Instead, the correct understanding is:

The final goal is always to complete the task first and then generate the answer. The only difference is that some tasks happen to not require Tool calls.

It is important to note that large language models themselves usually have difficulty proactively admitting:
```
This problem cannot be solved.
I could not find the answer.
I am not sure.
```
When a problem truly cannot be solved, without additional constraints, the model often does not automatically stop. Instead, it may continue searching, planning, or even start generating hallucinations (Hallucination), producing answers that appear reasonable but are actually incorrect.

Therefore, in practical engineering systems, the number of Agent loops, Tool Calls, or Planning steps is usually limited by the Runtime.

An LLM with only prompts and without a Runtime cannot be considered an Agent. The core factor that gives an Agent engineering capabilities is the Runtime.

## Agent Runtime

### What is Runtime

Runtime is essentially the execution infrastructure of an AI Agent. It manages the Agent's lifecycle, state, computing resources, and interactions with external systems, ensuring that the Agent can operate reliably, securely, and at scale.

It is the infrastructure or platform that enables an Agent to run, process inputs, execute tasks, and deliver outputs in real time or near real time.

> Responsible for:
>
> Maintaining State and Session;  
> Managing Memory;  
> Calling Tools;  
> Controlling workflows;  
> Handling permissions and exceptions;  
> Deciding which information enters Context;  
> Interacting with the external environment.

🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig4.png" width="70%">

</div>


**Typical Runtime**

When the LLM determines that a Tool is required, it sends the Tool Call intention to the Runtime. The Runtime then uses the MCP Client to call the corresponding MCP Server.

However, this pipeline misses one important component:

> "I want to search whether the library has Harry Potter."  
> "Where can I find this book?"  
> Which book does "this book" refer to?

**State:**  
There is a hidden component here called State.

State is used to store information that the Agent needs to continuously maintain during task execution, such as whether the user is logged in, identity permissions, conversation history, current task progress, previously called tools, tool results, and business data (such as whether a book has already been borrowed or whether there are overdue payments).

This information is not lost after a single model call. Instead, it is maintained by the Runtime.

When a user sends a new request, the Runtime uses the current State and provides task-relevant information to the LLM, helping the model understand the context and decide which Tool or API should be called next.

For example, when a user says:

"Help me renew this book."

The LLM itself does not know which book "this book" refers to. The Runtime uses the borrowing records and current conversation information stored in State, provides the relevant information to the LLM, and allows the model to correctly call the corresponding renewal API.

Regarding the above statement about *Runtime selection*:

The Runtime itself does not think autonomously. The Runtime selects task-relevant information according to rules or workflows predefined by developers to organize the State.

The component that truly understands this information is the LLM, not the Runtime.

### Context

In each round, the LLM does not only look at the current sentence. It receives multiple types of information simultaneously, including the system prompt, tool list, conversation history, session/user state, permission status, retrieval results, and the current user input.

The Runtime is responsible for organizing these pieces of information into a controllable execution process.

Context refers to the total information received by the LLM during each inference process.

Context can include many types of information, such as conversation history, user queries, current outputs, tool lists, and system prompts.

Context represents the information received by the model during the current inference step, while Memory is the mechanism used by the system to store information over a longer period.

Context is a temporary input, while Memory provides the information used to construct Context.

The context window size of mainstream models represents the maximum number of tokens that a model can process in a single interaction.

The maximum size of Context and the number of tokens it can contain are determined by the context window.

🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig5.png" width="70%">

</div>


Note that the Context Window is not equal to Memory.


**Types of AI Agent Memory**

Memory can be divided into short-term memory and long-term memory.


**Short-term Memory / Working Memory**

Short-term Memory (STM) is the system used by an Agent to maintain the immediate context of the current conversation and task.

It mainly includes:

- Conversation buffer (Context) memory: Maintains recent conversation history through a rolling window to ensure contextual relevance of responses;
- Working memory: Stores temporary information during the current task, such as intermediate results and variable values.

Short-term memory is limited by the size of the context window and is suitable for simple conversations and single-task scenarios.


**Long-term Memory**

Long-term Memory (LTM) is the form of memory used by an Agent to store knowledge across sessions and tasks over a long period of time.

It corresponds to persistent memories in the human brain, such as factual knowledge and past experiences.

The implementation of long-term memory usually relies on external storage or knowledge bases, including but not limited to:

- Summary memory: Extracting key summaries from long conversations and storing them;
- Structured knowledge databases: Using databases or knowledge graphs to store structured information;
- Vectorized storage: Using vector databases to achieve semantic-based memory retrieval.

Long-term memory enables Agents to accumulate experience and knowledge over time. It is especially suitable for knowledge-intensive applications and scenarios requiring long-term personalization.

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig6.png" width="70%">

</div>

---
### Session State and Memory in Conversation Memory

Common approaches for managing contextual memory:

Session: Represents the current conversation thread. It describes an ongoing interaction process between the user and the Agent system. It contains the chronological record of user messages and the operations performed by the Agent (called Events) during this specific interaction process.

A Session can also store temporary data that is only valid during the current conversation (SessionState).

State (session.state): Represents the data in the current conversation. It is the data stored within a specific Session. It is used to manage information related only to the currently active session, such as the shopping cart content in the current conversation or user preferences mentioned during this session.

Memory: Represents an information storage system that may span multiple historical Sessions or include external data sources. It acts as a knowledge base, allowing the Agent to retrieve information through search or obtain contextual information beyond the current conversation.

Besides Chat API managing Memory by itself, there is also another Session-based API pattern.

For example, the Completion API does not pass the context directly. Instead, it only sends the current state and session ID, while the server maintains the session. Both Gemini and Claude support these two approaches.

The client only needs to send the current input and session_id, while the historical records are maintained by the server, meaning developers do not need to manually manage Conversation History.

It should be noted that both Chat API and traditional Completion API are essentially stateless. Both can include historical information, and both can send only the current input. The difference mainly lies in the input format and context management approach, rather than whether the model itself has memory capability.

Essentially, both approaches are implementations of Conversation Memory, and both solve the problem of short-term context memory.

Conversational Context: Session, State, and Memory - Agent Development Kit (ADK)

**Summarized memory:**  
Short-term memory can maintain conversation continuity, but it cannot scale indefinitely. As conversations become longer, blindly replaying every piece of information becomes inefficient and unreliable. Summarized memory solves this problem.

It captures:

> User intention  
Important facts  
Decisions and constraints

It explicitly does not store:

> Every sentence  
Casual conversations  
Redundant confirmations

https://medium.com/@sitaramireddy1994/summarized-memory-in-ai-agents-compressing-conversation-without-losing-intent-c0cf7678071c

## **Agent Capability Sources (Tool)**

### Tool

Tools: LLMs do not have any ability to interact with the external environment by themselves. Without environmental interaction, they cannot perform external tasks, while Tools provide the way to access and interact with the environment.

However, LLMs can obtain additional information that is missing from model parameters through external APIs. This is especially important because model weights are difficult to modify after pre-training.

The existence and permissions of Tools are defined by developers, while whether to call a specific Tool is dynamically determined by the LLM within the Runtime environment according to the current task.

Prompt engineering can stimulate or guide the capabilities already existing in the model. However, these capabilities are fundamentally determined by the model itself, and the upper limit of capability still depends on model weights.

Some models naturally have stronger capabilities, while some models may not achieve good results even with additional prompts.

🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig7.png" width="70%">

</div>

Tool represents the capability boundary of an Agent.

Runtime is responsible for managing and scheduling Tools, but Tools themselves usually exist as independent components outside the Runtime (such as local functions, APIs, or MCP Servers).

LLM cannot create new Tools from nothing, nor can it automatically discover new Tools through the internet.

Only Tools that are pre-integrated and registered into the Runtime by developers can provide corresponding capabilities to the Agent.

Therefore, even if a banking Agent knows how to order food, it cannot complete the task if the Runtime does not integrate a food-ordering related Tool.

### MCP

Even with the most advanced models, performance can be greatly limited if they cannot connect to the external world to obtain necessary data and context.

**LLM is responsible for "making decisions based on tasks and tool descriptions, such as deciding whether to call a Tool"; Runtime is responsible for executing "Tool calls"; MCP is responsible for "providing a unified tool communication protocol".**

- Model Context Protocol (MCP) is an open protocol that standardizes the connection between Agent applications and external Tools or data sources.

It can be understood as a unified Tool integration standard (similar to how all smartphones use the Type-C interface).

It is also a type of capability used by Runtime. Unlike traditional Tools, its difference is that it provides a packaged black-box interface.

MCP Server can expose multiple Tools to Agent Runtime to solve real-world tasks.

The advantage of MCP Server is its high reusability across applications (different Runtimes).

- The significance of MCP is to unify the connection method between AI applications and external Tools or data sources.

As long as an Agent application implements an MCP Client, and the model being used supports or can be adapted by the framework into a Tool-calling mode, the same group of MCP Servers can be reused without developing separate Tool integration code for each model.

> **After binding Tools to a LangGraph model, can we switch models without using MCP?**
It is possible, but the model cannot be switched without any modification.

For example, in LangGraph, we can define a set of traditional Tools:

```
tools = [search_tool, database_tool, calculator_tool]
```

and then bind them to the model:

```
model_with_tools = model.bind_tools(tools)
```
In theory, the model can be switched from OpenAI to another model that supports Tool Calling, such as Qwen.

The Tools in LangChain essentially have clearly defined input and output structures. They can be treated as callable functions and passed to the chat model, allowing the model to decide when to call them.

> However, it should be noted that:
>
> The new model must support Tool Calling.  
> Different models do not have completely identical Tool Calling capabilities.  
> A traditional LangGraph Tool is not equivalent to an MCP Tool.

**The advantage of directly binding Tools to LangGraph is simplicity, making it suitable for individual projects. When switching models, the LangGraph workflow and Tools can usually be reused, but the model adapter needs to be replaced, and the new model's Tool Calling capability must be verified.**

**Using MCP provides a stronger decoupling between the Tool layer and the model layer, but it does not mean that switching to any model requires zero modification.**

- From an engineering perspective, MCP Server can essentially be understood as a Wrapper. It encapsulates real capabilities such as APIs, databases, RAG systems, and search engines into a unified standard interface for Runtime to call.

- However, MCP is also a relatively "heavyweight" solution. Since all capabilities need to be packaged according to the MCP specification, it is similar to carrying a complete toolbox.

For large-scale systems, complex Agents, and multi-model scenarios, this standardization provides significant scalability. However, if the requirement is simply to call a single Tool, directly calling an API is often more lightweight, and introducing the entire MCP ecosystem may not be necessary.

### Tool Calling

- Some Tools can be packaged into MCP Server interfaces and provided to MCP Clients. However, it should be noted that Tools do not necessarily need to be converted into MCP format.

Traditional Agents can directly bind Tools, while MCP provides a standardized approach to encapsulate Tools.

Why package Tools into an MCP Server first instead of directly connecting to them? Why not directly integrate APIs?

This is mainly an engineering design consideration.

When different Agents need to share the same Tools, MCP enables "develop once, use in multiple places." MCP solves the reusability problem at the Tool layer and reduces the cost of modifying the Tool layer when changing models.

However, its core goal is not model migration, but rather the standardization and reuse of Tool capabilities.

The prerequisite for using MCP is that the Agent Runtime implements an MCP Client, and the Runtime can expose Tool Calling capabilities to the LLM.

```
For example:

Claude Desktop -> MCP Client -> MCP Server

LangGraph -> MCP Client -> MCP Server

Both Runtimes can call the same Tool.
```

- MCP Client is responsible for connecting to the Server, obtaining Tool descriptions, initiating calls, and returning results to the Runtime. Within the Agent Runtime, it is responsible for discovering Tools, reading Tool descriptions, initiating calls, and receiving results. Therefore, when the model or upper-level framework changes, the underlying Tool integration method does not need to be completely rewritten.

- MCP Server can be understood as a server that wraps external Tools, databases, file systems, search services, or business APIs into a unified protocol.

The actual business logic still exists in the APIs, databases, or services behind the MCP Server. The Agent Runtime only calls them through standardized protocol interfaces.

In practical scenarios, directly binding Tools in LangGraph is more common than using MCP.

### Skill

- Skill (Skill Package) belongs to the Agent capability layer. It is used to tell the Agent how to complete a certain type of task, including execution workflows, which Tools to use, and what constraints to follow.

It can be understood as an on-demand loading task instruction manual. It is not a new Tool, but rather an encapsulation of the knowledge, workflows, and Tools required to complete a specific type of task.

- In traditional Tool Calling, the Runtime usually needs to provide all Tool names, functional descriptions, and calling methods to the LLM in advance, allowing the model to determine which Tool should be called.

When there are many Tools, these descriptions consume a large amount of Context, increase Prompt length, and may also affect the model's reasoning efficiency.

- The design idea of Skill is on-demand loading.

The Runtime does not provide all task knowledge and Tool descriptions to the model at the beginning. Instead, it first loads the corresponding Skill according to the user's current task type.

For example, when a user wants to analyze an Excel file, the Runtime only loads the Excel Analysis Skill at that time, rather than loading GitHub, database, or browser-related Skills simultaneously.

- Skill can be understood as a compressed instruction manual (Instruction Manual).

Although LLMs may already have the basic ability to complete tasks, different enterprise systems often have their own workflows, standards, and Tool usage methods.

Without this instruction manual, the model does not know which workflow the current system recommends, which Tools should be prioritized, or how each step of the task should be organized.

The role of Skill is to provide these additional instructions to the model at the beginning of a task, allowing the model to complete tasks according to the specifications of the current Runtime.


> A Skill usually contains the following contents:
>
> The goal and applicable scenarios of the current task;  
> Recommended execution workflow;  
> Best practices and constraints;  
> Which Tools or scripts are required for the current task, and how to use these Tools.

It should be noted that Skill itself does not execute tasks and does not actually provide Tools.

Skill is more like a "user guide". It only tells the model:

"To complete this task, which steps are recommended and which Tools should be called."

The actual execution is still performed by the Tools provided by the Runtime (such as local Tools or Tools provided through MCP Server).

**Relationship between Skill, MCP, and LLM**

- Skill, LLM, and MCP are located at different layers of an Agent system.

LLM is responsible for understanding tasks and performing reasoning and decision-making.

Skill is an on-demand loaded task instruction manual that provides LLM with workflows, best practices, and recommended Tools for completing a certain type of task.

MCP is a unified Tool communication protocol that enables the Runtime to connect and call various external Tools in a consistent way.

Skill does not execute tasks, and MCP does not guide task execution. Together, they help LLM complete complex tasks more efficiently and systematically.

- Skill and MCP may appear together, but they do not depend on each other.

An Agent can use both Skill and MCP, or only use one of them.

> Skill is a "guide". Without it, LLM can still complete tasks, but it may lack standardized workflows and best practices.

Without MCP, Runtime can still directly call local functions, SDKs, or APIs to use Tools.

However, these Tools usually need to be adapted separately for different Runtimes or Agent frameworks.

When the same set of Tools needs to be shared across multiple Runtimes (such as LangGraph, Claude Desktop, Cursor, OpenAI Agents SDK, etc.), developers may need to repeatedly develop and maintain different interfaces.

MCP solves this problem by using a unified protocol to package Tools into standardized MCP Servers, allowing different Runtimes to reuse the same Tools without developing separate integration logic for each platform.



## RAG

Retrieval-Augmented Generation (RAG) refers to optimizing the output of large language models by allowing them to reference authoritative knowledge bases outside the training data before generating responses.

Large Language Models (LLMs) are trained on massive datasets and use billions of parameters to generate outputs for tasks such as answering questions, translating languages, and completing sentences.

Based on the powerful capabilities of LLMs, RAG extends them by enabling access to internal knowledge bases of specific domains or organizations without retraining the model.

This provides a cost-effective method to improve LLM outputs, allowing them to maintain relevance, accuracy, and usefulness in different scenarios.

### RAG Pipeline

🧩🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig8.png" width="70%">

</div>

A complete RAG pipeline usually includes:

Document cleaning and splitting (chunking), embedding database construction, query rewriting or expansion, retrieval, reranking, context compression, citation preservation, LLM generation, and answer verification.

Before adding RAG, the knowledge source of LLMs mainly comes from training data.

After adding RAG, the system first retrieves relevant information and then provides the retrieved content to the LLM.

The internal knowledge of the LLM itself does not change, but the input prompt becomes longer because additional retrieved context is added.

### Chunking

Long documents are split into smaller segments and stored in the vector database.

- If the chunks are too small, for example, each segment contains only 100 tokens, important context may be lost.

For example, one segment may only contain:

"This method is suitable for the above situation."

However, the explanation of "the above situation" appears in the previous segment. After retrieval, the LLM may still not understand the meaning.

- If the chunks are too large, for example, each segment contains 2000 tokens, although the context is more complete, the semantic information may become too mixed.

The embedding representation may be diluted by many irrelevant details, resulting in inaccurate retrieval.

Chunk size usually does not have a fixed optimal value. It should be adjusted according to document type and task requirements.

General documents are usually around 300-800 tokens.

Code and tables usually need to be split according to their structures.

It is important to preserve titles, sections, and metadata.

Sometimes overlap is used to prevent answers from being cut off exactly at chunk boundaries. A common overlap ratio is 10%-20%.

### Embedding

Embedding in RAG is usually a separate model. It can be understood as a semantic indexing tool that converts documents into vectors and stores them in a vector database.

> Example:
>
> Suppose you have a document:
>
> "Harry Potter is a magic novel."
>
> The Embedding model converts it into a vector and stores it in the vector database.
>
> When a user asks:
>
> "Where can I find Harry Potter?"
>
> The query is also converted into a vector.
>
> The system compares whether the two vectors are close:
>
> User query vector vs. document chunk vector.
>
> If the distance is close, it means the semantics are related. The corresponding document segment is retrieved and then provided to the LLM for answering.

Choosing an embedding model depends on language, domain, and evaluation results.

For Chinese scenarios, models such as BGE, M3E, E5, and text-embedding series can be considered.

Higher dimensionality does not always mean better performance, because it increases storage and retrieval costs.

When the domain difference is large, fine-tuning the embedding model or introducing hybrid retrieval can be considered.

### Retrieval

After receiving a Query, the system does not ask the LLM first.

Instead, it searches the relevant knowledge base and uses the retrieved results to enhance the context.

### Reranking

The retrieval process may return many candidates, but we usually only need the most relevant top results.

The challenge is how to ensure that the retrieved content is the best choice and how to prevent the LLM from generating incorrect answers when relevant information does not exist.

Retrieval focuses on recalling as much relevant information as possible.

Rerank focuses on selecting the most suitable segments from candidate results to place into the Context.

The goals of the two stages are different:

During retrieval, it is acceptable to retrieve more candidates.

During reranking, the system controls quality and token cost.
