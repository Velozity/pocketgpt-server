import logger from "@/lib/logger";
import _ from "lodash";
import { Configuration, OpenAIApi } from "openai";

class OpenAIClient {
  private apiKey: string;

  private openai: OpenAIApi;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  public async completeChatPrompt(
    messages: { content: string; role: "system" | "user" | "assistant" }[],
    {
      titleEmpty,
    }: {
      titleEmpty?: boolean;
    }
  ): Promise<{
    success?: boolean;
    text?: string;
    error?: string;
    title?: string;
  }> {
    try {
      // generation

      const res = await this.openai.createChatCompletion({
        messages,
        model: "gpt-3.5-turbo",
      });

      if (titleEmpty) {
        // see if a title can be made,
        // recommend a new title
        const titleRes = await this.openai.createChatCompletion({
          messages: [
            {
              content:
                "Write a 5-25 character title for the following chat: " +
                JSON.stringify(messages),
              role: "user",
            },
          ],
          model: "gpt-3.5-turbo",
        });

        let title = titleRes.data.choices[0].message?.content.trim();
        if (title && title[0] === '"' && title[title.length - 1] === '"') {
          title = title?.slice(1);
          title = title.slice(0, title.length - 1);
        }
        //pocketgpt.velozity.dev/api/callbacks/subscription
        https: return {
          success: true,
          text: res.data.choices[0].message?.content.trim(),
          title: titleRes.data.choices[0].message?.content
            .trim()
            .replace(/"/g, ""),
        };
      }

      return {
        success: true,
        text: res.data.choices[0].message?.content.trim(),
      };
    } catch (err) {
      logger.error(err);
      return {
        error: "Something went wrong!",
      };
    }
  }
}

const client = new OpenAIClient(process.env.OPENAI_API_KEY || "");
export default client;
