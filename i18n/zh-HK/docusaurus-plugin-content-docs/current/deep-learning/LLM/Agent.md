# Agent
## Agent 整體鏈路
### 什麼是Agent
「Agent」可以有多種定義。一些客戶將Agent定義為完全自主的系統，能夠在較長時間內獨立運行，使用各種工具完成複雜任務。也有人用該術語來描述遵循預定義工作流程的更具規範性的實現。

**Agent的組成部分** 

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig1.png" width="70%">

</div>

圖片來源：https://www.bilibili.com/video/BV1uNk1YxEJQspm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8


工程上實現可以拆分出四個核心模組：推理、記憶、工具、行動

### Agent完整工作流程
Agent 是一個能夠感知環境、進行推理決策、調用工具並根據反饋持續完成任務的軟件系統。LLM通常作為Agent的推理核心，但Agent並不等同於LLM。我們認為，僅僅簡單的LLM（Prompt）不能被稱為Agent，Agent系統的基本構建模組是一個通過檢索、工具和記憶等增強功能的LLM。現有的模型可以主動利用這些能力，生成自己的搜索查詢，選擇合適的工具並確定要保留哪些信息。

🧩🧩🧩
<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig2.png" width="70%">

</div>

Agent的重點不在於模型，而是讓模型真正具備完成任務的能力。

🧩🧩🧩🧩

<div align="center">
<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig3.png" width="70%">
</div>

Agent 決策流程圖

圖片來源：https://www.bilibili.com/video/BV1uNk1YxEJQspm_id_from=333.788.videopod.episodes&vd_source=cdbd526603d180d53ccd6caa6a2ec439&p=8

**感知：** 需要從外部環境接收到輸入，需要知道提問的內容是什麼，完成感知後會將內容交給LLM。

**規劃：** 通過LLM的規劃能力對任務進行拆解，更好地解決這個問題。

關於子任務拆分原則：需要遵循子任務之間盡量獨立，每一個任務對應一個Tool，這樣有利於工程化，每一步都需要有明確的輸出。Agent 的拆分粒度過粗會降低可靠性，過細則會增加推理成本和上下文複雜度，因此工程上通常希望每個步驟都對應一個明確的目標和可驗證的輸出。

**行動：** 對當前的子任務進行解決並得到一個反饋。

**觀察：** 但是我們不知道這個反饋是好還是壞，因此需要進行反思。如果結果良好，就會繼續規劃下一個任務；如果結果不理想，則需要重新思考下一步規劃是否需要重新制定。

### LLM在Agent框架中的作用
LLM 在整個框架中更像是負責推理和決策的大腦，但它本身並不能直接與外界交互，也不能直接面向使用者。沒有 Runtime 的話，即使模型知道應該怎麼做，也沒有執行環境，就像一個人被放置在虛無之中，無法真正完成任何任務。

**LLM回答的方式：**
LLM本身只負責根據輸入生成輸出，在Agent框架中會通過Runtime構建循環，一種常見的執行模式是ReAct（Reasoning-Acting）循環：
> 思考（Reason）  
> 如果需要則調用工具（Act）  
> 得到結果（Observation）  
> 生成最終答案（Final Answer）

區別僅在於：

有些問題不需要訪問外部環境，例如：

> Hi, how are you?

LLM 可以直接根據已有知識生成答案；

更多時候，LLM 會發現自己缺少必要的信息或者需要執行某些操作，於是會要求 Runtime 調用對應的 Tool。工具並不只是 API，也可能是MCP、數據庫、RAG 檢索、搜索引擎、本地代碼執行器甚至其他 Agent。

因此，不應該簡單地理解為存在「兩種回答方式」，而應該理解為：

最終一定是先完成任務，再生成答案。只是有些任務恰好不需要調用工具而已。

需要注意的是，大模型本身通常很難主動承認：
''''
這個問題無法解決
我沒有找到答案
我不確定
''''

在真正無法解決的時候，如果沒有額外限制，模型往往不會自動停止，而是繼續搜索、規劃甚至開始產生幻覺（Hallucination），編造出看似合理但實際上錯誤的答案。因此，在實際工程中，Agent 的循環次數、Tool Call 次數或者 Planning 次數通常都會由 Runtime 人為設置上限。

沒有Runtime的LLM（Prompt）不能被稱為Agent，真正讓Agent具備工程能力的核心在於Runtime。

## Agent Runtime
### Runtime 是什麼
Runtime 本質是AI Agent 的執行基礎設施。它管理Agent的生命周期、狀態、計算資源以及與外部系統的交互，從而確保Agent能夠可靠、安全且大規模地運行。它是使Agent能夠運行、處理輸入、執行任務並實時或近實時地交付輸出的基礎設施或平台。

> 負責：
> 維護 State 和 Session；  
管理 Memory；  
調用 Tool；  
控制工作流；  
處理權限和異常；  
決定哪些信息進入 Context；  
與外部環境交互。

🧩🧩🧩
<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig4.png" width="70%">

</div>


**典型runtime**

當 LLM 判斷需要使用工具時，它會將 Tool Call 的意圖交給 Runtime，再由 Runtime 通過 MCP Client 調用對應的 MCP Server。

但是這一條鏈漏了一個東西：

> 「我要搜索圖書館是否有哈利波特」「哪裡有這本書」這本書指的是哪一本？

**State：** 這裡隱藏了一個東西叫做state，State 用來保存 Agent 在執行任務過程中需要持續維護的信息，例如使用者是否已經登入、身份權限、歷史對話、當前任務進展、已經調用過哪些工具、工具返回的結果，以及一些業務數據（如是否已借書、是否存在欠款等）。這些信息不會因為一次模型調用而丟失，而是由 Runtime 統一維護。當使用者發起新的請求時，Runtime 會根據當前 State，選擇其中與本次任務相關的信息提供給 LLM，幫助模型理解上下文，並決定下一步應該調用哪個 Tool 或 API。例如，當使用者說「幫我續借這本書」時，LLM 本身並不知道「這本書」是哪一本，而是 Runtime 根據 State 中保存的借閱記錄和當前對話信息，將相關內容提供給 LLM，模型才能正確調用對應的續借 API。

關於上述陳述中*Runtime的選擇*：Runtime本身是不會自主思考的，Runtime選擇任務相關信息是按照開發者預先定義好的規則（Rule）或流程（Workflow）來組織 State。真正理解這些信息的是 LLM，而不是 Runtime。

### Context
LLM 每輪並不是只看當前一句話，而是會同時接收 system prompt、工具列表、對話歷史、session/user state、權限狀態、檢索結果和當前使用者輸入。Runtime 負責將這些信息組織成可控的執行流程。

Context表示大模型每次處理任務時所接收到的信息總和。Context中包含很多內容，包括對話歷史、使用者問題、當前輸出、工具列表以及system prompt等。Context是模型當前一次推理所接收到的信息，而Memory是系統長期保存信息的機制。Context是一次性的輸入，Memory是用於生成Context的數據來源。

主流模型的context window 大小（上下文）表示大模型每次接收任務時能夠容納的最大token數量。

而Context能有多大，其中包含多少tokens，則由context window來表示。

🧩🧩🧩
<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig5.png" width="70%">

</div>


注意Context window並不等於Memory。



**AI Agent的記憶類型**

記憶Memory：分為短期記憶以及長期記憶。


**短期記憶/工作記憶**

短期記憶（Short-term Memory, STM）是智能體維護當前對話和任務的即時上下文系統，主要包括：

會話緩衝（Context）記憶：保留最近對話歷史的滾動窗口，確保回答的上下文相關性；

工作記憶：存儲當前任務的臨時信息，例如中間結果、變量值等。

短期記憶受限於上下文窗口大小，適用於簡單對話和單一任務場景。

**長期記憶**

長期記憶（Long-term Memory, LTM）是智能體用於跨會話、跨任務長期保存知識的記憶形式。它對應於人類大腦中持久保存的記憶，例如事實知識、過去經歷等。長期記憶的實現通常依賴於外部存儲或知識庫，包括但不限於：

- 摘要記憶：將長對話內容提煉為關鍵摘要進行存儲；
- 列表項結構化知識庫：使用數據庫或知識圖譜存儲結構化信息；
- 列表項向量化存儲：通過向量數據庫實現基於語義的記憶檢索。

長期記憶使智能體能夠隨著時間累積經驗和知識，它特別適用於知識密集型應用和需要長期個性化的場景。

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig6.png" width="70%">

</div>

---

### 會話語境（Conversation Memory）中的Session State 和Memory

當前常用的解決上下文記憶方法：

Session：表示當前的對話線程。表示使用者與 Agent 系統之間一次正在進行的交互過程。它包含在這次特定交互過程中，使用者消息以及 Agent 所執行的操作（稱為 Events）的時間順序記錄。一個 Session 還可以保存僅在當前會話期間有效的臨時數據（SessionState）。

State（session.state）：表示當前對話中的數據。存儲在某一個特定 Session 內部的數據。用於管理僅與當前活躍會話相關的信息，例如當前聊天中的購物車內容，或者使用者在本次會話中提到的偏好設置。

Memory：表示一個可能跨越多個歷史 Session，或者包含外部數據源的信息存儲系統。它充當一個知識庫，Agent 可以通過搜索它來回憶信息，或者獲取當前會話之外的上下文內容。

除了 Chat API 自己管理 Memory 之外，也存在另一種基於 Session 的 API 模式。例如 Completion API 不會傳遞 context，只會傳遞當前的狀態以及 session id，在服務端記住 session。包括 Gemini 和 Claude 都支持這兩種方式。客戶端只需要發送當前輸入以及 session_id，歷史記錄由服務端維護，開發者無需自己管理 Conversation History。

需要注意的是，無論是 Chat API 還是傳統 Completion API，本身都是無狀態的，兩者都可以攜帶歷史信息，也都可以只發送當前輸入，區別主要在於輸入格式和上下文管理方式，而不是模型是否具有記憶能力。

本質上都屬於 Conversation Memory 的實現方式，兩者解決的都是短期上下文的記憶問題。

Conversational Context: Session, State, and Memory - Agent Development Kit (ADK)

**Summarized memory（摘要記憶）：** 短期記憶能夠保證對話的連續性，但它無法擴展。隨著對話時間的延長，盲目地重放每條信息會變得既費時費力又不可靠。Summarized Memory 可以解決這個問題。

它捕捉到了：

> 使用者意圖  
重要事實  
決策與約束

它明確表示不存儲：

> 每一句話  
閒談  
冗餘確認

https://medium.com/@sitaramireddy1994/summarized-memory-in-ai-agents-compressing-conversation-without-losing-intent-c0cf7678071c

## **Agent 能力來源（Tool）**

### Tool

工具（Tools）：LLM 不具備任何與外部環境交互的能力，沒有環境交互它不能做任何事情，而工具是訪問環境的方法。但是它可以通過外接 API 的形式來獲得模型權重所缺少的額外信息。這對於預訓練之後難以修改的模型權重來說是非常重要的。

Tool 的存在和權限由開發者定義，而是否調用某個 Tool，則由 LLM 在 Runtime 環境下根據當前任務動態決定。可以通過提示工程激發或者引導模型已有的能力，但是實際上這些能力是固化的，能力上限依然由模型的權重決定。有些模型天生能力就強，但是有些模型即使加入提示詞也不一定能取得很好的結果。
🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig7.png" width="70%">

</div>

Tool 是 Agent 能力的邊界。Runtime 負責管理和調度 Tool，但 Tool 本身通常作為獨立組件存在於 Runtime 外部（例如本地函數、API 或 MCP Server）。LLM 無法憑空創造新的 Tool，也不會自動聯網發現新的 Tool。只有開發者預先接入並註冊到 Runtime 的 Tool，Agent 才具備相應的能力。因此，一個銀行 Agent 即使知道如何點外賣，如果 Runtime 中沒有接入點餐相關的 Tool，它也無法完成該任務。

### MCP

即使擁有最前沿的模型，如果無法連接外部世界獲得必要數據和上下文，效果就會大打折扣。

**LLM 負責「根據任務和工具描述進行決策，例如決定是否調用工具」，Runtime 負責執行「調用工具」，MCP 負責「統一工具通信協議」。**

- 模型上下文協議（MCP）是一個開源協議，標準化了 Agent 應用與外部工具、數據源之間的連接方式。可以理解為一套統一的工具接入標準（例如所有手機都是 Type-C 接口）。也是一個 Runtime 使用的工具，與其他工具不同的地方在於它是一個打包好的黑盒。MCP Server 可以為 Agent Runtime 暴露多個工具來解決現實任務。MCP Server 的優勢在於跨應用（不同 Runtime）的高度可復用性。

- MCP 的意義在於統一 AI 應用與外部工具、數據源之間的連接方式。只要某個 Agent 應用實現了 MCP Client，並且所使用的模型支持或能夠被框架適配為工具調用模式，就可以復用同一批 MCP Server，而不需要為每個模型重新開發工具接入代碼。

> **把工具綁定到 LangGraph 模型後是否可以不用 MCP 進行模型切換？**

可以，但是不能無修改地切換。例如我們在 LangGraph 中定義了一組普通工具：
''''
tools = [search_tool, database_tool, calculator_tool]
''''

然後綁定給模型：

''''
model_with_tools = model.bind_tools(tools)
''''

理論上可以把模型從 OpenAI 換成其他支持工具調用的模型，例如 Qwen。LangChain 的工具本質上具有明確的輸入輸出結構，可以作為可調用函數傳遞給聊天模型，由模型決定何時調用。

> 但需要注意的是：
> 
> 新模型必須支持工具調用  
> 不同模型的工具調用能力並不完全一致  
> 普通 LangGraph Tool 不等於 MCP Tool  

**直接把工具綁定到 LangGraph 的優點在於簡單，適合單個項目。切換模型時，LangGraph 流程和工具通常可以復用，但是需要更換模型適配器，並檢查新的模型是否支持工具調用。**

**使用 MCP 則會讓工具層與模型層的解耦更加徹底，但不代表切換任何模型都一定零修改。**

- 從工程角度看，MCP Server 本質上可以理解為一個 Wrapper，它把真實的 API、數據庫、RAG、搜索引擎等能力統一封裝成標準接口供 Runtime 調用。

- 不過，MCP 也是一種比較「重」的方案。因為所有能力都需要按照 MCP 規範進行封裝，就像隨身攜帶一個完整工具箱。對於大型系統、複雜 Agent 和多模型場景，這種標準化帶來了巨大的擴展性；但如果只是簡單調用一個工具，那麼直接調用 API 往往更加輕量，不一定需要引入完整的 MCP 體系。

### Tool Calling

- 有些 Tool 會被打包成一個 MCP Server 接口提供給 MCP Client，但是需要注意 Tool 本身不一定需要 MCP 化。傳統 Agent 可以直接綁定 Tool，而 MCP 提供了一種標準方式，將 Tool 封裝為統一接口。

為什麼要先打包成 MCP Server，而不是直接連接呢？為什麼不能直接接入 API 呢？

這更多是一個工程設計問題。不同 Agent 之間需要共享工具，有了 MCP 就可以一次開發，多處使用。MCP 解決了 Tool 層復用的問題，MCP 降低了模型切換時工具層修改的成本，但它的核心目標不是模型遷移，而是工具能力的標準化和復用。

使用 MCP 的前提是 Agent Runtime 實現了 MCP Client，同時 Runtime 能夠將工具調用能力暴露給 LLM。

- 例如
```
Claude Desktop -> MCP Client -> MCP Server
LangGraph -> MCP Client -> MCP Server
两个Runtime都可以调用同一个工具
```

- MCP Client 負責連接 Server、獲取工具描述、發起調用以及將結果返回給 Runtime。在 Agent Runtime 中，它負責發現工具、讀取工具描述、發起調用並接收結果。這樣當模型或上層框架發生變化時，底層工具接入方式不需要全部重新編寫。

- MCP Server 可以理解為將外部工具、數據庫、文件系統、搜索服務或業務 API 封裝成統一協議的服務端。

真正的業務邏輯仍然存在於 MCP Server 背後的 API、數據庫或服務中，Agent Runtime 只通過協議化接口調用它們。

實際場景中，LangGraph 綁定 Tools 的情況通常會比使用 MCP 的情況更多。

### Skill

- Skill（技能包）屬於 Agent 能力層，用於告訴 Agent 如何完成某一類任務，包括執行流程、使用哪些工具以及遵守哪些約束。可以理解為一種按需加載（On-demand Loading）的任務說明書，它並不是新的 Tool，而是對完成某類任務所需知識、流程和工具的封裝。

- 在傳統的 Tool Calling 中，Runtime 往往需要提前將所有 Tool 的名稱、功能描述和調用方式提供給 LLM，使模型能夠判斷應該調用哪個 Tool。當 Tool 數量很多時，這些描述會占用大量上下文（Context），增加 Prompt 長度，也會影響模型的推理效率。

- Skill 的設計思想就是按需加載。Runtime 在開始時並不會把所有任務知識和工具說明都提供給模型，而是先根據當前使用者的任務類型，加載對應的 Skill。例如，當使用者希望分析 Excel 文件時，Runtime 才會加載 Excel Analysis Skill，而不會同時加載 GitHub、數據庫或瀏覽器相關的 Skill。

- 可以將 Skill 理解為一份壓縮後的說明書（Instruction Manual）。LLM 雖然可能已經具備完成任務的基礎能力，但不同企業系統往往有自己的工作流程、規範以及工具使用方式。如果沒有這份說明書，模型並不知道當前系統推薦採用什麼流程、應該優先調用哪些 Tool、每一步應該如何組織任務。而 Skill 的作用，就是在任務開始時為模型提供這些額外的指導信息，使模型能夠按照當前 Runtime 的規範完成任務。


> 一個 Skill 通常會包含以下內容：
> 
> 當前任務的目標和適用場景；
> 推薦的執行流程（Workflow）；
> 最佳實踐和約束條件；
> 當前任務需要使用哪些 Tool 或腳本，以及這些 Tool 的使用方法。

需要注意的是，Skill 本身並不負責執行任務，也不會真正提供 Tool。Skill 更像是一份「使用指南」，它只是告訴模型：「完成這項任務建議按照哪些步驟進行，並需要調用哪些 Tool。」真正執行操作的仍然是 Runtime 提供的 Tool（例如本地 Tool 或通過 MCP Server 提供的 Tool）。

**Skill、MCP、LLM之間的關係**

- Skill、LLM 和 MCP 分別位於 Agent 的不同層次。LLM 負責理解任務和推理決策；Skill 是按需加載的任務說明書，為 LLM 提供完成某類任務的流程、最佳實踐以及建議使用的 Tool；MCP 則是一種統一的工具通信協議，負責讓 Runtime 能夠以一致的方式連接和調用各種外部 Tool。Skill 不負責執行任務，MCP 不負責指導任務，它們共同輔助 LLM 更高效、更規範地完成複雜任務。

- Skill 與 MCP 會同時出現，但它們彼此沒有依賴關係。一個 Agent 可以同時使用 Skill 和 MCP，也可以只使用其中一個。

> Skill 是「指導者」，沒有它，LLM 仍然可以完成任務，只是可能缺少規範和最佳實踐。

沒有 MCP，Runtime 仍然可以直接調用本地函數、SDK 或 API 來使用 Tool，但這些 Tool 通常需要針對不同 Runtime 或 Agent 框架分別進行適配。當需要在多個 Runtime（如 LangGraph、Claude Desktop、Cursor、OpenAI Agents SDK 等）之間共享同一套 Tool 時，就可能需要重複開發和維護不同的接口。而 MCP 通過統一協議，將 Tool 封裝為標準化的 MCP Server，使不同 Runtime 能夠復用同一套 Tool，而無需為每個平台重新開發接入邏輯。


## RAG

檢索增強生成（RAG）是指對大語言模型輸出進行優化，使其能夠在生成響應之前引用訓練數據來源之外的權威知識庫。大語言模型（LLM）使用海量數據進行訓練，利用數十億個參數為回答問題、翻譯語言和完成句子等任務生成原始輸出。在 LLM 本身強大的功能基礎上，RAG 將其擴展為能夠訪問特定領域或組織的內部知識庫，而無需重新訓練模型。這是一種經濟高效地改進 LLM 輸出的方法，使其在各種情境下都能保持相關性、準確性和實用性。

### RAG流程

🧩🧩🧩🧩

<div align="center">

<img src="https://raw.githubusercontent.com/Linshu-Song/SAIL_image_hosting/main/Agentimg/fig8.png" width="70%">

</div>

一個完整的 RAG 鏈路通常包括：文檔清洗與切分（chunking）、embedding 建庫、query 改寫或擴展、retrieval 召回、rerank 重排、上下文壓縮、引用來源保留、LLM 生成以及答案校驗。

在加入 RAG 之前，LLM 的知識來源主要來自訓練數據；加入 RAG 之後，系統會先檢索相關資料，然後將資料提供給 LLM。LLM 本身的參數內容不會改變，但是輸入的 Prompt Context 會變長。

### Chunking

將長文檔切分成小段後，再存入向量庫。

- 切分太小，例如每段 100 tokens，可能會丟失上下文。例如一段只寫「該方法適用於上述情況」，但是「上述情況」位於上一段，檢索出來後 LLM 也無法理解。
- 切分太大，例如每段 2000 tokens，雖然上下文更加完整，但是語義過於混雜，Embedding 會被大量無關信息稀釋，導致召回結果不準確。

Chunk size 通常並不是固定答案，一般需要根據文檔類型以及任務需求進行調整。普通文檔通常約為 300-800 tokens；代碼或表格通常需要按照結構進行切分；同時需要注意保留標題、章節以及 metadata。

有時會使用 overlap 來避免答案剛好被切斷，常用 overlap 比例約為 10%-20%。

### Embedding

RAG 中的 Embedding 通常是一個獨立模型，可以理解為一個語義索引工具，它會將文檔轉化為向量，然後存入向量數據庫。

> 舉例：比如你有一篇文檔：「哈利波特是一本魔法小說。」
>
> Embedding 模型會將它轉換成一個向量，然後存入向量數據庫。
>
> 當使用者詢問：「哪裡能找到哈利波特？」時，該問題也會被轉換為向量。
>
> 系統會比較兩個向量是否接近：使用者問題向量 vs 文檔片段向量。
>
> 如果距離較近，說明兩者語義相關，就會取出這段文檔，再交給 LLM 生成答案。

選擇 Embedding 模型需要考慮語言、領域以及評測結果。中文場景可以考慮 bge、m3e、e5、text-embedding 系列。維度越高不一定越好，因為會增加存儲和檢索成本。當領域差異較大時，可以考慮微調 Embedding 模型或者引入混合檢索。

### Retrieval

系統收到 Query 後，不會先詢問 LLM，而是先在相關知識庫中進行搜索，將相關檢索結果加入上下文中進行增強。

### Reranking

檢索結果通常會返回多個候選內容，而我們希望選擇其中最相關的前幾個結果。如何保證獲取最佳內容，需要通過合理設計檢索和排序策略，同時避免 LLM 在不存在相關信息時產生錯誤回答。

Retrieval 負責盡可能召回相關內容，Rerank 負責從候選結果中挑選最適合放入 Context 的片段。兩者目標不同：召回階段通常希望儘可能多獲取候選內容，而重排階段則負責控制質量以及 Token 成本。

