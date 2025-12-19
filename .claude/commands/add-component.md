---
description: Add shadcn/ui components from any registry with search, preview, and examples
allowed-tools: mcp__shadcn__*, Bash, Read, Glob
argument-hint: "[component-name or search query]"
---

# Add shadcn/ui Component

You are helping the user add shadcn/ui components to their project.

## User Request

$ARGUMENTS

## Workflow

### 1. Search for Component

Search across all registries:

```
Use mcp__shadcn__search_items_in_registries with:
- registries: ["@shadcn", "@magicui", "@aceternity", "@motion-primitives", "@animate-ui", "@kokonutui"]
- query: "{user's search term}"
```

### 2. Show Component Details

Once found, view the component details:

```
Use mcp__shadcn__view_items_in_registries with the component name
```

### 3. Get Usage Examples

Show usage examples for the component:

```
Use mcp__shadcn__get_item_examples_from_registries with:
- registries: ["{registry}"]
- query: "{component-name}-demo" or "{component-name} example"
```

### 4. Generate Add Command

Get the CLI command to add the component:

```
Use mcp__shadcn__get_add_command_for_items with the full item path
```

### 5. Install Component

Run the add command:

```bash
npx shadcn@latest add @{registry}/{component} --overwrite
```

## Popular Registries for Tier Maker

| Registry           | Focus               | Good For                  |
| ------------------ | ------------------- | ------------------------- |
| @shadcn            | Core components     | Buttons, Cards, Dialogs   |
| @magicui           | Animated components | Marquee, Globe, Particles |
| @aceternity        | Modern effects      | Hover effects, Gradients  |
| @motion-primitives | Motion primitives   | Smooth animations         |
| @animate-ui        | Animated UI         | Interactive elements      |

## Project-Specific Notes

- Components go to `src/components/ui/`
- Uses Tailwind CSS with CSS variables for theming
- Supports dark/light mode via `next-themes`
- Uses `cn()` utility from `src/lib/utils.ts`

## Output

- Show component preview/details
- Display usage examples
- Provide the exact CLI command
- Run installation if user confirms
- Show any required dependencies
