# Nosana Builders Challenge: Agent-101

![Agent-101](./assets/NosanaBuildersChallengeAgents.jpg)

---

## 🧠 Agent Description and Purpose

### 🔹 Name: **Land Intelligence AI Agent**

This agent analyzes tokenized land NFTs to provide on-chain land intelligence using LLMs and geospatial data.

### 🔍 **Purpose:**

* ✅ **Detect land overlaps** using geospatial data from existing NFTs
* ✅ **Fetch nearby amenities** (e.g. schools, hospitals, roads) using OpenStreetMap's Overpass API
* ✅ **Suggest land use-cases** based on surrounding infrastructure (e.g. good for estate, farming, or commercial use)
* ✅ **Generate human-readable reports** using LLMs like Qwen2.5 via Ollama
* ✅ **Suggest field visit itineraries** based on relevant POIs around a land plot

This agent helps real estate investors, land buyers make informed decisions about land assets stored as NFTs.

---

### 🧠 Tech Stack:

* 🧱 ERC-1155 Land NFTs w/ metadata stored on IPFS
* 🛰️ OpenStreetMap API (Overpass) for nearby infrastructure
* 🧠 Qwen2.5 LLM served via Ollama
* ⚙️ Mastra Agent Framework
* 🔥 Firebase for storage and OpenSea link tracking

---

Here are the **Setup Instructions** for your Land Intelligence AI Agent — perfect for your `README.md`, Docker Hub, or Nosana submission:

---

## ⚙️ Setup Instructions

This guide shows you how to run the Land Intelligence AI Agent locally or in Docker, using an LLM served by [Ollama](https://ollama.com).

---

### 📦 Requirements

* [Node.js 20+](https://nodejs.org)
* [pnpm](https://pnpm.io/)
* [Docker](https://www.docker.com/)
* (Optional) [Ollama](https://ollama.com) installed locally

---

### 📁 Clone the Project

```bash
git clone https://github.com/jnationj/agent-challenge.git
cd agent-challenge
```

---

### 🧪 Run Locally (with Ollama installed)

1. **Start Ollama and pull model:**

```bash
ollama serve
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b
```

2. **Set up environment:**

Create a `.env` file:

```env
API_BASE_URL=http://localhost:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
```

3. **Install dependencies and run:**

```bash
pnpm install
pnpm run dev
```

The Mastra playground will be available at [http://localhost:8080](http://localhost:8080)

---

### 🐳 Run with Docker (self-contained)

> Runs Ollama and the agent in the same container.

1. **Build the image:**

```bash
docker build -t jnationj/agent-challenge:latest .
```

2. **Run the container:**

```bash
docker run --env-file .env.docker -p 8080:8080 jnationj/agent-challenge:latest
```

The agent will automatically:

* Start Ollama
* Pull the Qwen model
* Start the agent on port 8080

---

### 🚀 Deploy on Nosana

1. Create a `nosana_agent.json` with:

```json
{
  "ops": [
    {
      "id": "agent",
      "args": {
        "gpu": true,
        "image": "docker.io/jnationj/agent-challenge:latest",
        "entrypoint": ["/bin/sh"],
        "cmd": ["-c", "/start.sh"],
        "expose": [{ "port": 8080 }]
      },
      "type": "container/run"
    }
  ],
  "meta": {
    "trigger": "dashboard",
    "system_requirements": {
      "required_vram": 4
    }
  },
  "type": "container",
  "version": "0.1"
}
```

2. Go to [https://dashboard.nosana.io](https://dashboard.nosana.io) and submit the job.

---



## Get Started

To get started run the following command to start developing:
We recommend using [pnpm](https://pnpm.io/installation), but you can try npm, or bun if you prefer.

```sh
pnpm install
pnpm run dev
```

### Getting Started
1. **Clone the [Land AI Agent](https://github.com/jnationj/agent-challenge)**
2. **Install dependencies** with `pnpm install`
3. **Run the development server** with `pnpm run dev`
4. **Build your agent** using the Mastra framework

### How to build Land AI Agent

Here we will describe the steps needed to build land ai agent.

#### Folder Structure

This repo, there is the `Land Agent`.
This is a working agent for our submission that allows a user to chat with an LLM, and fetches real amenities data for the provided land coordinate (Real world case plot of land).

There is main folders we need to pay attention to:

- [src/mastra/agents/land-agent/](./src/mastra/agents/land-agent/)

In `src/mastra/agents/land-agent/` you will find a complete submission of a working agent. Complete with Agent definition, API calls, interface definition, basically everything needed to get a full fledged working agent up and running.


We also provided the [src/mastra/agents/land-agent/land-workflow.ts](./src/mastra/agents/land-agent/land-workflow.ts) file. This file contains how you can chain agents and tools to create a workflow, in this case, the user provides their 4 coordinate ploygon, and the agent retrieves the a boolean overlaps or not, basic amenities and land use suggestion for the location, and suggests an itinerary for example you want to check if there are schools areound the property etc

### LLM-Endpoint

Agents depend on an LLM to be able to do their work.

#### Nosana Endpoint

You can use the following endpoint and model for testing, if you wish:

```
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
API_BASE_URL= http://127.0.0.1:11434/api
```

#### Running Your Own LLM with Ollama

The default configuration uses a local [Ollama](https://ollama.com) LLM.
For local development or if you prefer to use your own LLM, you can use [Ollama](https://ollama.ai) to serve the lightweight `qwen2.5:1.5b` mode.

**Installation & Setup:**

1. **[ Install Ollama ](https://ollama.com/download)**:

2. **Start Ollama service**:

```bash
ollama serve
```

3. **Pull and run the `qwen2.5:1.5b` model**:

```bash
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b
```

4. **Update your `.env` file**

There are two predefined environments defined in the `.env` file. One for local development and another, with a larger model, `qwen2.5:32b`, for more complex use cases.

**Why `qwen2.5:1.5b`?**

- Lightweight (only ~1GB)
- Fast inference on CPU
- Supports tool calling
- Great for development and testing

Do note `qwen2.5:1.5b` is not suited for complex tasks.

The Ollama server will run on `http://localhost:11434` by default and is compatible with the OpenAI API format that Mastra expects.

---

## ✅ Environment Variables

| Variable                 | Description                                    | Example                                           |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------- |
| `API_BASE_URL`           | URL for the Ollama API                         | `http://127.0.0.1:11434/api` *(inside container)* |
| `MODEL_NAME_AT_ENDPOINT` | The LLM model to load via Ollama               | `qwen2.5:1.5b`                                    |
| `PORT` *(optional)*      | Port your agent will run on (defaults to 8080) | `8080`                                            |

---

## ✅ Full `.env.docker` Example

```dotenv
API_BASE_URL=http://127.0.0.1:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b
PORT=8080
```

You can pass this file to Docker like:

```bash
docker run --env-file .env.docker -p 8080:8080 jnationj/agent-challenge:latest
```

---

## 🔍 Used For:

* `API_BASE_URL`: Needed so the agent knows where to call Ollama for LLM responses
* `MODEL_NAME_AT_ENDPOINT`: Used in `ollama pull` to fetch the correct model
* `PORT`: Tells Mastra or your server which port to bind to (if your app supports it)

---



### Testing Land Agent

You can read the [Mastra Documentation: Playground](https://mastra.ai/en/docs/local-dev/mastra-dev) to learn more on how to test your agent locally.
Before deploying your agent to Nosana, it's crucial to thoroughly test it locally to ensure everything works as expected. Follow these steps to validate land agent:

**Local Testing:**

1. **Start the development server** with `pnpm run dev` and navigate to `http://localhost:8080` in your browser
2. **Test your agent's conversation flow** by interacting with it through the chat interface
3. **Verify tool functionality** by triggering scenarios that call your custom tools
4. **Check error handling** by providing invalid inputs or testing edge cases
5. **Monitor the console logs** to ensure there are no runtime errors or warnings

**Docker Testing:**
After building your Docker container, test it locally before pushing to the registry:

```bash
# Build your container
docker build -t jnationj/agent-challenge:latest .

# Run it locally with environment variables
docker run -p 8080:8080 --env-file .env.docker jnationj/agent-challenge:latest

# Test the containerized agent at http://localhost:8080
```

Ensure your agent responds correctly and all tools function properly within the containerized environment. This step is critical as the Nosana deployment will use this exact container.

#### 2. Docker Container

- container URL for our land-agent submission [https://hub.docker.com/r/jnationj/agent-challenge](https://hub.docker.com/r/jnationj/agent-challenge)


#### 3. Nosana Deployment

- Deploy land-agent Docker container on Nosana
- Land-agent successfully ran on the Nosana network
- Include the Nosana job ID or deployment link
- [Dashboard](https://dashboard.nosana.com/jobs/EtQhTT4c8TCFYCCTZVyVRGjev2Bir6LoWiZGC5x53ss3)
- [Deployment Link](https://3rzzc2pzv3ubpfmvpfkdbaz5g8ctphgujkegixnxnzyb.node.k8s.prd.nos.ci/agents/landAgent/chat)
  
  
##### Nosana Job Definition

We have included a Nosana job definition at <./nos_job_def/nosana_agent.json>, that you can use to publish land agent to the Nosana network.

**A. Deploying using [@nosana/cli](https://github.com/nosana-ci/nosana-cli/)**

- Published docker image to the `image` property. `"image": "docker.io/jnationj/agent-challenge:latest"`
- Download and install the [@nosana/cli](https://github.com/nosana-ci/nosana-cli/)
- Load your wallet with some funds
  - Retrieve your address with: `nosana address`
  - Go to our [Discord](https://nosana.com/discord) and ask for some NOS and SOL to publish your job.
- Run: `nosana job post --file nosana_agent.json --market nvidia-4090 --timeout 30`
- Go to the [Nosana Dashboard](https://dashboard.nosana.com/deploy) to see your job

**B. Deploying using the [Nosana Dashboard](https://dashboard.nosana.com/deploy)**

- Make sure you have https://phantom.com/, installed for your browser.
- Go to our [Discord](https://nosana.com/discord) and ask for some NOS and SOL to publish your job. OR
- Fund it yourself by buying NOS from exchange [Gate](https://gate.com) or MEXC
- Click the `Expand` button, on the [Nosana Dashboard](https://dashboard.nosana.com/deploy)
- Copy and Paste `<./nos_job_def/nosana_agent.json>` Nosana Job Definition file into the Textarea
- Choose an appropriate GPU for the AI model that you are using
- Click `Deploy`

#### 5. Example usage

🧪 Example Usage
Once the agent is running (locally, in Docker, or on Nosana), you can interact with it using the Mastra Agent Playground or via API.

✅ 1. Open the Playground
Visit the running agent in your browser:

```
http://localhost:8080
```

You'll see the Mastra AI Playground where you can interact with the Land Intelligence Agent using plain language.

✅ 2. Example Prompts
Try asking:

```
Analyze this land:
Sure! Continuing the **Example Usage** section:

---
Analyze this land:
[
  [52.3667, 4.8945],
  [52.3668, 4.8955],
  [52.3658, 4.8956],
  [52.3657, 4.8946]
]

```
```
Is this land already registered?
[
[4.81790, 7.00644],
[4.81780, 7.00622],
[4.81765, 7.00636],
[4.81775, 7.00658],
]
```

The agent will:

* ✅ Check for overlap with existing land NFTs on-chain
* ✅ Fetch nearby amenities (e.g. hospitals, schools, roads) within 500m
* ✅ Suggest possible land use-cases (e.g. estate, farm, market)

---

Short video demo 4mins: https://youtu.be/epZ8IRD0J3Y
