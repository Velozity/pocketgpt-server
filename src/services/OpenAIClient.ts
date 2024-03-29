import logger from "@/lib/logger";
import _ from "lodash";
import { Configuration, OpenAIApi } from "openai";
import * as parse from "@fortaine/fetch-event-source/parse";
import { openAIConfiguration } from "@/lib/config";

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
    tokensUsed: number,
    {
      titleEmpty,
      onPartialResponse,
    }: {
      titleEmpty?: boolean;
      onPartialResponse?: any;
    }
  ): Promise<{
    success?: boolean;
    text?: string;
    error?: string;
    title?: string;
  }> {
    try {
      // generation
      console.time("start completion");
      const res: any = await this.openai.createChatCompletion(
        {
          messages,
          model: "gpt-3.5-turbo",
          stream: true,
        },
        { responseType: "stream" }
      );

      let fullResponse = "";
      let count = 0;
      await new Promise<void>((resolve, reject) => {
        res.data.on(
          "data",
          parse.getLines(
            parse.getMessages((event) => {
              if (event.data === "[DONE]") {
                resolve();
                return;
              }

              try {
                const parsed = JSON.parse(event.data);
                if (!parsed.choices[0].delta.content) return;

                fullResponse += parsed.choices[0].delta.content;
                onPartialResponse(parsed.choices[0].delta.content, count++);
              } catch (error) {
                console.error("Could not JSON parse stream message", error);
              }
            })
          )
        );

        res.data.on("end", () => {
          console.log("end");
          resolve();
        });
      });

      console.timeEnd("start completion");
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

        return {
          success: true,
          text: fullResponse.trim(),
          title: titleRes.data.choices[0].message?.content
            .trim()
            .replace(/"/g, ""),
        };
      }

      return {
        success: true,
        text: fullResponse.trim(),
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
