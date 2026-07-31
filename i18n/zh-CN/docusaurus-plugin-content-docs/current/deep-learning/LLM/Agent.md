# Agent
## Agent 整体链路
### 什么是Agent
“Agent”可以有多种定义。一些客户将Agent定义为完全自主的系统，能够在较长时间内独立运行，使用各种工具完成复杂任务。也有人用该术语来描述遵循预定义工作流程的更具规范性的实现。

**Agent的组成部分** 

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig1.png)

图片来源：https://www.bilibili.com/video/BV1uNk1YxEJQspm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8

工程上实现可以拆分出四个核心模块：推理、记忆、工具、行动

### Agent完整工作流程
我们认为，只是简单的LLM（Prompt）不能被称为Agent，Agent系统的基本构建模块是一个通过检索、工具和内存等增强功能的LLM。现有的模型可以主动利用这些能力，生成自己的搜索查询，选择合适的工具并确定要保留哪些信息。

🧩🧩🧩
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig2.png)

Agent的重点不在于模型，而是让模型真正具备完成任务的能力。

🧩🧩🧩🧩
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig3.png)

Agent 决策流程图

图片来源：https://www.bilibili.com/video/BV1uNk1YxEJQspm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8

**感知：** 需要从外部环境接收到输入，需要知道问的问题是什么，有了感知之后会把内容交给LLM。

**规划：** 通过LLM的规划能力对任务进行拆解，更好的解决这个问题。

关于子任务拆分原则：要遵循子任务之间尽量独立，每一个任务对应一个Tool这样有利于工程化、每一步都要有明确的输出。Agent 的拆分粒度过粗会降低可靠性，过细则会增加推理成本和上下文复杂度，因此工程上通常希望每个步骤都对应一个明确的目标和可验证的输出。

**行动：** 对当前的子任务进行解决得到一个反馈。

**观察：** 但是我们不知道这个反馈是好的还是坏的，进行反思，如果是好的就会接着继续规划下一个任务，如果不是好的就会思考看下一步规划是否需要重新制定。

### LLM在agent框架中的作用
LLM 在整个框架中更像是负责推理和决策的大脑，但它本身并不能直接与外界交互，也不能直接面向用户。没有 Runtime 的话，即使模型知道应该怎么做，也没有执行环境，就像一个人被放在虚无之中，无法真正完成任何任务。

**LLM回答的方式：**
从本质上来说，LLM 的回答方式其实只有一种：
> 思考（Reason）
如果需要则调用工具（Act）
得到结果（Observation）
生成最终答案（Final Answer）

区别仅在于：
有些问题不需要访问外部环境，例如： 
> Hi, how are you?

LLM 可以直接根据已有知识生成答案；
更多时候，LLM 会发现自己缺少必要的信息或者需要执行某些操作，于是会要求 Runtime 调用对应的 Tool。工具并不只是 API，也可能是MCP、数据库、RAG 检索、搜索引擎、本地代码执行器甚至其他 Agent。 
因此，不应该简单地理解为存在“两种回答方式”，而应该理解为：
最终一定是先完成任务，再生成答案。只是有些任务恰好不需要调用工具而已。
需要注意的是，大模型本身通常很难主动承认：
```
这个问题无法解决
我没有找到答案
我不确定
```
在真正无法解决的时候，如果没有额外限制，模型往往不会自动停止，而是继续搜索、规划甚至开始产生幻觉（Hallucination），编造出看似合理但实际上错误的答案。因此，在实际工程中，Agent 的循环次数、Tool Call 次数或者 Planning 次数通常都会由 Runtime 人为设置上限。
没有Runtime的LLM（Prompt）不能被称为Agent，真正让Agent具备工程能力的核心在于Runtime。

## Agent Runtime
### Runtime 是什么
Runtime 本质是AI Agent 的执行基础设施。它管理Agent的生命周期、状态、计算资源以及与外部系统的交互，从而确保Agent能够可靠、安全且大规模地运行。它是使Agent能够运行、处理输入、执行任务并实时或近实时地交付输出的基础设施或平台。
> 负责：
> 维护 State 和 Session； 
管理 Memory； 
调用 Tool； 
控制工作流； 
处理权限和异常； 
组织 Context； 
与外部环境交互。

🧩🧩🧩
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig4.png)

典型runtime

当 LLM 判断需要使用工具时，它会把 Tool Call 的意图交给 Runtime，再由 Runtime 通过 MCP Client 调用对应的 MCP Server。

但是这一条链漏了一个东西：
>  “我要搜索图书馆是否有哈利波特”“哪里有这本书”这本书指的是哪一本？”

**State：** 这里隐藏了一个东西叫做state ，State 用来保存 Agent 在执行任务过程中需要持续维护的信息，例如用户是否已经登录、身份权限、历史对话、当前任务进展、已经调用过哪些工具、工具返回的结果，以及一些业务数据（如是否已借书、是否存在欠款等）。这些信息不会因为一次模型调用而丢失，而是由 Runtime 统一维护。当用户发起新的请求时，Runtime 会根据当前 State，选择其中与本次任务相关的信息提供给 LLM，帮助模型理解上下文，并决定下一步应该调用哪个 Tool 或 API。例如，当用户说"帮我续借这本书"时，LLM 本身并不知道"这本书"是哪一本，而是 Runtime 根据 State 中保存的借阅记录和当前对话信息，将相关内容提供给 LLM，模型才能正确调用对应的续借 API。
关于上述陈述中*Runtime的选择*：Runtime本身是不会自主思考的，Runtime选择任务相关信息是按照开发者预先定义好的规则（Rule）或流程（Workflow）来组织 State。真正理解这些信息的是 LLM，而不是 Runtime。

### Context
LLM 每轮并不是只看当前一句话，而是会同时接收 system prompt、工具列表、对话历史、session/user state、权限状态、检索结果和当前用户输入。Runtime 负责把这些信息组织成可控的执行流程。
Context表示大模型每次处理任务时所接收到的信息总和。Context中有很多内容包括对话历史、用户问题、当前输出、工具列表以及system prompt等，可以理解为大模型的临时记忆体。
主流模型的context window 大小（上下文）表示大模型每次接收任务时能容纳的最大token数量。
而Context能有多大，里面有多少tokens由context window来表示。

🧩🧩🧩
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig5.png)

注意Context window并不等于Memory。



**AI Agent的记忆类型**

记忆Memory：分为短期记忆以及长时间记忆。

**形成记忆：** 

大模型在大量包含世界知识的数据集上进行预训练，在预训练中，大模型通过调整神经元的权重来学习和理解生成人类语言，被视为“记忆”的形成过程，通过使用深度学习和梯度下降等技术，不断提高预测或者生成文本的能力进而形成长期记忆。存在硬件中不会遗忘。

**短期记忆/工作记忆**

短期记忆（Short-term Memory, STM）是智能体维护当前对话和任务的即时上下文系统，主要包括：
会话缓冲（Context）记忆：保留最近对话历史的滚动窗口，确保回答上下文相关性；
工作记忆：存储当前任务的临时信息，如中间结果、变量值等。
短期记忆受限于上下文窗口大小，适用于简单对话和单一任务场景。

**长期记忆**

长期记忆（Long-term Memory, LTM）是智能体用于跨会话、跨任务长期保存知识的记忆形式。它对应于人类的大脑中持久保存的记忆，例如事实知识、过去经历等。长期记忆的实现通常依赖于外部存储或知识库，包括但不限于：
- 摘要记忆：将长对话内容提炼为关键摘要存储；
- 列表项结构化知识库：使用数据库或知识图谱存储结构化信息；
- 列表项向量化存储：通过向量数据库实现基于语义的记忆检索。
长期记忆使智能体能够随着时间累积经验和知识，它特别适用于知识密集型应用和需要长期个性化的场景。

![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig6.png)

---

### 会话语境（Conversation Memory）中的Session State 和Memory
当前常用的解决上下文记忆方法：
Session：表示当前的对话线程。表示用户与 Agent 系统之间一次正在进行的交互过程。它包含在这次特定交互过程中，用户消息以及 Agent 所执行的操作（称为 Events）的时间顺序记录。一个 Session 还可以保存仅在当前会话期间有效的临时数据（SessionState）。

State（session.state）：表示当前对话中的数据。存储在某一个特定 Session 内部的数据。用于管理仅与当前活跃会话相关的信息，例如当前聊天中的购物车内容，或者用户在本次会话中提到的偏好设置。
Memory：表示一个可能跨越多个历史 Session，或者包含外部数据源的信息存储系统。它充当一个知识库，Agent 可以通过搜索它来回忆信息，或者获取当前会话之外的上下文内容。

除chat API自己管理memory之外，也存在另一种基于 Session 的 API 模式。比如Completion API是不会传的context的，只会传当前的状态以及session id，在服务端记住session。包括gemini和claude都是支持两种。客户端只需要发送当前输入以及 session_id，历史记录由服务端维护，开发者无需自己管理 Conversation History。需要注意的是，无论是 Chat API 还是传统 Completion API，本身都是无状态的，两者都可以携带历史信息，也都可以只发送当前输入，区别主要在于输入格式和上下文管理方式，而不是模型是否具有记忆能力。
本质上都属于Conversation Memory的实现方式，两者解决的都是短期上下文的记忆问题。
Conversational Context: Session, State, and Memory - Agent Development Kit (ADK)

**Summarized memory（摘要记忆）：** 短期记忆能够保证对话的连续性，但它无法扩展。随着对话时间的延长，盲目地重放每条信息会变得既费时费力又不可靠。summarized记忆可以解决这个问题。
它捕捉到了：
> 用户意图
重要事实
决策与约束

它明确表示不存储：

> 每一句话
闲谈
冗余确认

https://medium.com/@sitaramireddy1994/summarized-memory-in-ai-agents-compressing-conversation-without-losing-intent-c0cf7678071c

## **Agent 能力来源（Tool）**
### Tool
工具Tools：LLM是不具备任何与外部环境交互的能力的，没有环境交互他不能做任何事情，而工具是环境的一部分。但是它可以通过外接API的形式来获得模型权重所缺少的额外信息。 这对于预训练之后难以修改的模型权重来说是非常重要的。Tool 的存在和权限由开发者定义，而是否调用某个 Tool，则由 LLM 在 Runtime 环境下根据当前任务动态决定。可以通过提示工程激发或者引导模型已有的能力，但是实际上这些能力是固化的，能力上限依然由模型的权重决定，有些模型天生能力就强但是有些模型加入提示词也不会有很好的结果。

🧩🧩🧩
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig7.png)

Tool 是 Agent 能力的边界。Runtime 负责管理和调度 Tool，但 Tool 本身通常作为独立组件存在于 Runtime 外部（例如本地函数、API 或 MCP Server）。LLM 无法凭空创造新的 Tool，也不会自动联网发现新的 Tool。只有开发者预先接入并注册到 Runtime 的 Tool，Agent 才具备相应的能力。因此，一个银行 Agent 即使知道如何点外卖，如果 Runtime 中没有接入点餐相关的 Tool，它也无法完成该任务。

### MCP
即使拥有最前沿的模型，如果无法连接外部世界获得必要数据和上下文，效果就会大打折扣。
**LLM 负责"决定是否调用工具"，Runtime 负责"调用工具"，MCP 负责"统一工具通信协议"。**
- 模型上下文协议（MCP）这是一个开源协议，它标准化了大语言模型的连接与工作方式。可以理解为一套统一的工具接入标准（比如所有的手机都是type-C接口）。也是一个runtime使用的工具，与其他工具不同的地方就在于他是一个打包好的黑盒。MCP协议可以为LLMAgent提供数百种工具来解决现实任务。MCP服务器的优势在于跨应用(不同的runtime)的高度可复用性。

- MCP 的意义在于统一 AI 应用与外部工具、数据源之间的连接方式。只要某个 Agent 应用实现了 MCP Client，并且所使用的模型支持或能够被框架适配为工具调用模式，就可以复用同一批 MCP Server，而不需要为每个模型重新开发工具接入代码。
> **把工具绑定到LangGraph模型后是否可以不用MCP进行切换模型？**

可以但是不能无修改的切换，比如我们在Langgraph中定义了一组普通工具：
```
tools = [search_tool, database_tool, calculator_tool]
```
然后绑定给模型
```
model_with_tools = model.bind_tools(tools)
```
理论上可以把模型从OpenAi换成其他支持工具调用的模型如Qwen。Langchain的工具本质上有明确的输入输出结构可调用函数然后传递给聊天模型决定何时调用。
> 但需要注意的是：
新模型必须支持工具调用
不同模型的工具调用能力并不完全一致
普通 LangGraph Tool 不等于 MCP Tool
**直接把工具绑定到LangGraph的优点在于简单，适合单个的项目，切换模型时Langgraph流程和工具通常可以服用但是需要更换模型适配器，并检查新的模型是否支持工具调用。**
**使用 MCP 则会让工具层与模型层的解耦更彻底，但不代表切换任何模型都一定零修改。**

- 从工程角度看，MCP Server 本质上可以理解为一个 Wrapper，它把真实的 API、数据库、RAG、搜索引擎等能力统一封装成标准接口供 Runtime 调用。
- 不过，MCP 也是一种比较“重”的方案。因为所有能力都需要按照 MCP 规范进行包装，就像随身携带一个完整工具箱。对于大型系统、复杂 Agent 和多模型场景，这种标准化带来了巨大的扩展性；但如果只是简单调用一个工具，那么直接调用 API 往往更加轻量，不一定需要引入整个 MCP 体系。
### Tool Calling
- 有的tool都会被打包成一个MCP server 接口给MCP client。为什么要先打包成MCPserver而不是直接连接呢？ 为什么不能直接把api接过来呢？这里是工程学的东西，因为模型是一直换的，比如今天使用GPT，明天换成Qwen，他们的接口是不一样的，换了要重写。但所有模型都支持MCP接口，也许有自己的格式但是都会支持MCP接口，这样换模型就不需要进行修改了。
- MCP client 只是知道需要这个tool，不会知道具体怎么做，但是会帮忙call mcpserver这就是LangGraph的用处，不能让：LLM做权限控制，因为会有幻觉。我们可以在call tool之前先插入一个权限验证，过了之后agent runtime 过了之后再call MCP client。
- MCP Server 可以理解为把外部工具、数据库、文件系统、搜索服务或业务 API 包装成统一协议的服务端；MCP Client 则在 Agent Runtime 中负责发现工具、读取工具描述、发起调用并接收结果。这样模型或上层框架变化时，底层工具接入方式不需要全部重写。
真正的业务逻辑仍然在 MCP Server 背后的 API、数据库或服务中，Agent Runtime 只通过协议化接口调用它们。
实际场景中LangGraph绑Tools的情况会比使用MCP的情况多。
### Skill
- Skill（技能包）可以理解为一种按需加载（On-demand Loading）的任务说明书，它并不是新的 Tool，而是对完成某类任务所需知识、流程和工具的封装。

- 在传统的 Tool Calling 中，Runtime 往往需要提前将所有 Tool 的名称、功能描述和调用方式提供给 LLM，使模型能够判断应该调用哪个 Tool。当 Tool 数量很多时，这些描述会占用大量上下文（Context），增加 Prompt 长度，也会影响模型的推理效率。

- Skill 的设计思想就是按需加载。Runtime 在开始时并不会把所有任务知识和工具说明都提供给模型，而是先根据当前用户的任务类型，加载对应的 Skill。例如，当用户希望分析 Excel 文件时，Runtime 才会加载 Excel Analysis Skill，而不会同时加载 GitHub、数据库或浏览器相关的 Skill。

- 可以将 Skill 理解为一份压缩后的说明书（Instruction Manual）。LLM 虽然可能已经具备完成任务的基础能力，但不同 Runtime 或企业系统往往有自己的工作流程、规范以及工具使用方式。如果没有这份说明书，模型并不知道当前系统推荐采用什么流程、应该优先调用哪些 Tool、每一步应该如何组织任务。而 Skill 的作用，就是在任务开始时为模型提供这些额外的指导信息，使模型能够按照当前 Runtime 的规范完成任务。


> 一个 Skill 通常会包含以下内容：
当前任务的目标和适用场景；
推荐的执行流程（Workflow）；
最佳实践和约束条件；
当前任务需要使用哪些 Tool 或脚本，以及这些 Tool 的使用方法。

需要注意的是，Skill 本身并不负责执行任务，也不会真正提供 Tool。 Skill 更像是一份"使用指南"，它只是告诉模型："完成这项任务建议按照哪些步骤进行，并需要调用哪些 Tool。" 真正执行操作的仍然是 Runtime 提供的 Tool（例如本地 Tool 或通过 MCP Server 提供的 Tool）。

**Skill、MCP、LLM之间的关系**
- Skill、LLM 和 MCP 分别位于 Agent 的不同层次。LLM 负责理解任务和推理决策；Skill 是按需加载的任务说明书，为 LLM 提供完成某类任务的流程、最佳实践以及建议使用的 Tool；MCP 则是一种统一的工具通信协议，负责让 Runtime 能够以一致的方式连接和调用各种外部 Tool。Skill 不负责执行任务，MCP 不负责指导任务，它们共同辅助 LLM 更高效、更规范地完成复杂任务。

- Skill与MCP会同时出现，但它们彼此没有依赖关系。 一个 Agent 可以同时使用 Skill 和 MCP，也可以只使用其中一个。
> Skill 是"指导者"，没有它，LLM 仍然可以完成任务，只是可能缺少规范和最佳实践。
没有 MCP，Runtime 仍然可以直接调用本地函数、SDK 或 API 来使用 Tool，但这些 Tool 通常需要针对不同 Runtime 或 Agent 框架分别进行适配。当需要在多个 Runtime（如 LangGraph、Claude Desktop、Cursor、OpenAI Agents SDK 等）之间共享同一套 Tool 时，就可能需要重复开发和维护不同的接口。而 MCP 通过统一协议，将 Tool 封装为标准化的 MCP Server，使不同 Runtime 能够复用同一套 Tool，而无需为每个平台重新开发接入逻辑。



## RAG
检索增强生成（RAG）是指对大语言模型输出进行优化，使其能够在生成响应之前引用训练数据来源之外的权威知识库。大语言模型（LLM）用海量数据进行训练，使用数十亿个参数为回答问题、翻译语言和完成句子等任务生成原始输出。在 LLM 本就强大的功能基础上，RAG 将其扩展为能访问特定领域或组织的内部知识库，所有这些都无需重新训练模型。这是一种经济高效地改进 LLM 输出的方法，让它在各种情境下都能保持相关性、准确性和实用性。
### RAG流程

🧩🧩🧩🧩
![fig1](https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig8.png)

一个完整 RAG 链路通常包括：文档清洗与切分（chunking）、embedding 建库、query 改写或扩展、retrieval 召回、rerank 重排、上下文压缩、引用来源保留、LLM 生成和答案校验。
在加入RAG之前，LLM的知识来源就只有训练数据，加入RAG之后就会先去找相关的资料，然后把资料交给LLM，LLM的内容不变但是prompt变长了
### Chunking
把长文档切成小段再存入向量库。
- 切太小，例如每段 100 tokens，可能会丢失上下文。比如一段只写“该方法适用于上述情况”，但“上述情况”在上一段，检索出来后 LLM 也看不懂。
- 切太大，例如每段 2000 tokens，虽然上下文完整，但语义太杂，embedding 会被很多无关信息稀释，导致召回不准。
Chunk size通常并不是固定的答案，一般要根据文档的类型以及任务进行调整。一般的文档大概为300-800 tokens；代码或表格通常需要按照结构切；注意要保留标题章节以及metadata。
有时会使用overlap来避免答案刚好被切断，常用overlap 10%-20%。
### Embedding
RAG中的Embedding：这通常是一个单独的模型，可以理解为一个语义索引的工具，会把文档转化为一个向量，然后存进向量数据库。
> 举例：比如你有一篇文档：哈利波特是一本魔法小说。
Embedding 模型会把它变成一个向量，然后存进向量数据库。
当用户问：哪里能找到哈利波特？也会被转成向量。
统会比较两个向量是否接近：用户问题向量vs文档片段向量
如果距离很近，说明语义相关，就把这段文档找出来，再交给 LLM 回答

选择 embedding 要看语言、领域和评测结果。中文场景可以考虑 bge、m3e、e5、text-embedding 系列。维度高不一定更好，会增加存储和检索成本。领域差异大时，可以考虑微调 embedding 或引入混合检索
### Retrieval
系统在收到Query之后不会先去问LLM而是先去相关知识库中搜索。将相关的检索结果进行增强上下文。
### Reranking 
返回会有很多，我们要的是最好的前几个，怎样才能保证拿到，要怎么设计，怎么让LLM不要在没有这个东西的时候不要乱回。
Retrieval 负责尽量召回相关内容，Rerank 负责从候选结果中挑出最适合放入 context 的片段。两者目标不同：召回阶段宁可多拿一些，重排阶段再控制质量和 token 成本。
