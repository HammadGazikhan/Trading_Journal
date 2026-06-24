import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null) {
    return undefined;
  }
  return value;
};

const isValidScreenshotPath = (value: string) => {
  if (value.startsWith("/")) {
    return true;
  }
  return z.string().url().safeParse(value).success;
};

export const playbookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  conditions: z.preprocess(emptyToUndefined, z.string().optional()),
  entryRules: z.preprocess(emptyToUndefined, z.string().optional()),
  exitRules: z.preprocess(emptyToUndefined, z.string().optional()),
  riskRules: z.preprocess(emptyToUndefined, z.string().optional()),
  screenshot: z.preprocess(
    emptyToUndefined,
    z.string().refine(isValidScreenshotPath, "Invalid screenshot URL").optional()
  ),
});

export type PlaybookInput = z.infer<typeof playbookSchema>;
