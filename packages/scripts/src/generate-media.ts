import * as fs from 'node:fs';
import * as path from 'node:path';
import { fal } from '@fal-ai/client';

const VALID_ASPECT_RATIOS = [
  '21:9',
  '16:9',
  '3:2',
  '4:3',
  '5:4',
  '1:1',
  '4:5',
  '3:4',
  '2:3',
  '9:16',
] as const;

const VALID_RESOLUTIONS = ['1K', '2K', '4K'] as const;

const DEFAULT_MODEL = 'fal-ai/nano-banana-pro';
const DEFAULT_ASPECT_RATIO = '16:9';
const DEFAULT_RESOLUTION = '1K';

type AspectRatio = (typeof VALID_ASPECT_RATIOS)[number];
type Resolution = (typeof VALID_RESOLUTIONS)[number];

interface CliArgs {
  prompt: string;
  output: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  model: string;
}

function printUsage() {
  console.log(`
Usage: bun src/generate-media.ts --prompt "..." --output <path> [options]

Generate images using fal AI (Nano Banana Pro by default).

Required:
  --prompt <text>        Image generation prompt
  --output <path>        Where to save the image (relative or absolute)

Options:
  --aspect-ratio <r>     Aspect ratio (default: ${DEFAULT_ASPECT_RATIO})
                         Options: ${VALID_ASPECT_RATIOS.join(', ')}
  --resolution <r>       Resolution tier (default: ${DEFAULT_RESOLUTION})
                         Options: ${VALID_RESOLUTIONS.join(', ')}
  --model <id>           fal model (default: ${DEFAULT_MODEL})

Environment:
  FAL_KEY                Required. Your fal.ai API key.
`);
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  let prompt: string | undefined;
  let output: string | undefined;
  let aspectRatio: string = DEFAULT_ASPECT_RATIO;
  let resolution: string = DEFAULT_RESOLUTION;
  let model: string = DEFAULT_MODEL;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--prompt':
        prompt = args[++i];
        break;
      case '--output':
        output = args[++i];
        break;
      case '--aspect-ratio':
        aspectRatio = args[++i];
        break;
      case '--resolution':
        resolution = args[++i];
        break;
      case '--model':
        model = args[++i];
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  if (!prompt) {
    console.error('Error: --prompt is required');
    printUsage();
    process.exit(1);
  }

  if (!output) {
    console.error('Error: --output is required');
    printUsage();
    process.exit(1);
  }

  if (!VALID_ASPECT_RATIOS.includes(aspectRatio as AspectRatio)) {
    console.error(
      `Error: Invalid aspect ratio "${aspectRatio}". Valid options: ${VALID_ASPECT_RATIOS.join(', ')}`
    );
    process.exit(1);
  }

  if (!VALID_RESOLUTIONS.includes(resolution as Resolution)) {
    console.error(
      `Error: Invalid resolution "${resolution}". Valid options: ${VALID_RESOLUTIONS.join(', ')}`
    );
    process.exit(1);
  }

  return {
    prompt,
    output,
    aspectRatio: aspectRatio as AspectRatio,
    resolution: resolution as Resolution,
    model,
  };
}

async function main() {
  const args = parseArgs();

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    throw new Error('FAL_KEY is not set. Get one at https://fal.ai/dashboard/keys');
  }

  fal.config({ credentials: FAL_KEY });

  console.log(`Generating image...`);
  console.log(`  Model: ${args.model}`);
  console.log(`  Aspect ratio: ${args.aspectRatio}`);
  console.log(`  Resolution: ${args.resolution}`);
  console.log(`  Prompt: ${args.prompt}`);

  const result = await fal.subscribe(args.model, {
    input: {
      prompt: args.prompt,
      aspect_ratio: args.aspectRatio,
      resolution: args.resolution,
    },
    onQueueUpdate(update) {
      if (update.status === 'IN_QUEUE') {
        console.log(`  Status: waiting in queue...`);
      } else if (update.status === 'IN_PROGRESS') {
        console.log(`  Status: generating...`);
      }
    },
  });

  const imageUrl = (result.data as any)?.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`No image URL in response. Response: ${JSON.stringify(result.data, null, 2)}`);
  }

  console.log(`  Downloading from: ${imageUrl}`);

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  const outputPath = path.resolve(args.output);
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  console.log(`\nSaved: ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to generate media:', error);
  process.exit(1);
});
