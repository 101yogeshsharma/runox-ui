// scripts/generate-mcp-registry.js
// Generates dist/mcp-registry.json — the AI-enriched component registry.
// Consumed by MCP server tools: get_component_api, get_component_example, search_components.
// Runs automatically as part of the postbuild step.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const registry = {
  box: {
    name: "Box",
    description:
      "Polymorphic layout primitive. The foundation for all layout composition — surfaces, radius, shadow, and interactivity in one component.",
    import: `import { Box } from "@runox/ui";`,
    propsTable: [
      {
        name: "as",
        type: "React.ElementType",
        default: '"div"',
        description: "Polymorphic element type",
      },
      {
        name: "surface",
        type: '"default" | "card" | "muted" | "popover" | "transparent"',
        default: '"default"',
        description: "Background surface token",
      },
      {
        name: "radius",
        type: '"none" | "sm" | "md" | "lg" | "full"',
        default: "undefined",
        description: "Border radius scale",
      },
      {
        name: "shadow",
        type: '"none" | "sm" | "md" | "lg" | "xl"',
        default: "undefined",
        description: "Shadow depth",
      },
      {
        name: "isInteractive",
        type: "boolean",
        default: "false",
        description: "Adds hover/focus interaction styles",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Card Surface",
        code: '<Box surface="card" radius="md" shadow="sm" className="p-4">\n  <p>Card content</p>\n</Box>',
      },
      {
        title: "Interactive Box",
        code: '<Box surface="muted" radius="lg" isInteractive className="p-6 cursor-pointer">\n  <p>Click me</p>\n</Box>',
      },
    ],
  },
  text: {
    name: "Text",
    description:
      "Polymorphic typography primitive. Supports semantic variants, gradients, truncation, and all standard text decorations.",
    import: `import { Text } from "@runox/ui";`,
    propsTable: [
      {
        name: "as",
        type: "React.ElementType",
        default: '"p"',
        description: "Polymorphic element type",
      },
      {
        name: "variant",
        type: '"h1" | "h2" | "h3" | "h4" | "body" | "body-sm" | "caption" | "overline" | "code"',
        default: '"body"',
        description: "Typography scale variant",
      },
      {
        name: "color",
        type: '"primary" | "secondary" | "brand" | "success" | "danger" | "warning" | "inherit"',
        default: "undefined",
        description: "Text color token",
      },
      {
        name: "gradient",
        type: '"primary" | "info" | "success" | "warning" | "danger" | "ai"',
        default: "undefined",
        description: "Gradient text fill",
      },
      {
        name: "weight",
        type: '"normal" | "medium" | "semibold" | "bold"',
        default: "undefined",
        description: "Font weight",
      },
      {
        name: "truncate",
        type: "boolean",
        default: "false",
        description: "Truncate with ellipsis",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Heading",
        code: '<Text as="h1" variant="h1">Page Title</Text>',
      },
      {
        title: "AI Gradient",
        code: '<Text variant="h2" gradient="ai">AI-Powered</Text>',
      },
      {
        title: "Caption",
        code: '<Text variant="caption" color="secondary">Last updated 2 hours ago</Text>',
      },
    ],
  },
  flex: {
    name: "Flex",
    description:
      "Flexbox layout primitive with responsive props for direction, alignment, gap, and wrapping.",
    import: `import { Flex } from "@runox/ui";`,
    propsTable: [
      {
        name: "direction",
        type: '"row" | "col" | "row-reverse" | "col-reverse"',
        default: '"row"',
        description: "Flex direction",
      },
      {
        name: "justify",
        type: '"start" | "center" | "end" | "between" | "around" | "evenly"',
        default: '"start"',
        description: "Justify content",
      },
      {
        name: "align",
        type: '"start" | "center" | "end" | "stretch" | "baseline"',
        default: '"start"',
        description: "Align items",
      },
      {
        name: "gap",
        type: '"none" | "xs" | "sm" | "md" | "lg" | "xl"',
        default: '"none"',
        description: "Gap between children",
      },
      {
        name: "wrap",
        type: "boolean",
        default: "false",
        description: "Flex wrap",
      },
      {
        name: "fullWidth",
        type: "boolean",
        default: "false",
        description: "width: 100%",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Centered Row",
        code: '<Flex justify="center" align="center" gap="md">\n  <Button>A</Button>\n  <Button>B</Button>\n</Flex>',
      },
      {
        title: "Column Stack",
        code: '<Flex direction="col" gap="sm">\n  <Input placeholder="Name" />\n  <Input placeholder="Email" />\n</Flex>',
      },
    ],
  },
  button: {
    name: "Button",
    description:
      "Magnetic, glassmorphic button with 6 variants, 5 sizes, 8 color options, loading state, icons, and optional magnetic hover effect.",
    import: `import { Button } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"solid" | "outline" | "ghost" | "glass" | "icon" | "fab"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"default" | "primary" | "secondary" | "danger" | "success" | "warning" | "info" | "muted"',
        default: '"primary"',
        description: "Color palette",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg" | "icon" | "fab"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description: "Shows spinner, disables interaction",
      },
      {
        name: "fullWidth",
        type: "boolean",
        default: "false",
        description: "Stretches to container width",
      },
      {
        name: "isMagnetic",
        type: "boolean",
        default: "false",
        description: "Magnetic hover animation effect",
      },
      {
        name: "leftIcon",
        type: "React.ReactNode",
        default: "undefined",
        description: "Icon before label",
      },
      {
        name: "rightIcon",
        type: "React.ReactNode",
        default: "undefined",
        description: "Icon after label",
      },
      {
        name: "as",
        type: "React.ElementType",
        default: '"button"',
        description: "Render as another element",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Solid Primary",
        code: '<Button variant="solid" color="primary">Click Me</Button>',
      },
      {
        title: "Outline",
        code: '<Button variant="outline" color="secondary">Cancel</Button>',
      },
      { title: "Ghost", code: '<Button variant="ghost">Learn More</Button>' },
      {
        title: "Glass Magnetic",
        code: '<Button variant="glass" isMagnetic>Hover Me</Button>',
      },
      { title: "Loading", code: "<Button loading>Saving...</Button>" },
    ],
  },
  input: {
    name: "Input",
    description:
      "Text input with 4 visual variants, 3 sizes, label, error state, clearable, prefix/suffix slots, and compound sub-components.",
    import: `import { Input } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"outline" | "filled" | "glass" | "flushed"',
        default: '"outline"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "label",
        type: "string",
        default: "undefined",
        description: "Floating label",
      },
      {
        name: "error",
        type: "string",
        default: "undefined",
        description: "Error message",
      },
      {
        name: "clearable",
        type: "boolean",
        default: "false",
        description: "Shows clear button when value is set",
      },
      {
        name: "prefix",
        type: "React.ReactNode",
        default: "undefined",
        description: "Content before the input",
      },
      {
        name: "suffix",
        type: "React.ReactNode",
        default: "undefined",
        description: "Content after the input",
      },
    ],
    subComponents: [
      "Input.Group — wraps inputs and addons horizontally",
      "Input.Addon — addon before or after (position: 'before' | 'after')",
      "Input.Icon — icon inside input (position: 'left' | 'right')",
    ],
    variants: [
      {
        title: "Basic",
        code: '<Input placeholder="Enter your name" label="Full Name" />',
      },
      {
        title: "Glass with prefix",
        code: '<Input variant="glass" placeholder="Search..." prefix={<Search size={16} />} clearable />',
      },
      {
        title: "Error State",
        code: '<Input label="Email" type="email" error="Invalid email address" />',
      },
      {
        title: "Input Group",
        code: '<Input.Group>\n  <Input.Addon position="before">https://</Input.Addon>\n  <Input placeholder="yoursite.com" />\n</Input.Group>',
      },
    ],
  },
  select: {
    name: "Select",
    description:
      "Accessible dropdown select with 3 visual variants, 3 sizes, compound sub-components, and full keyboard navigation.",
    import: `import { Select } from "@runox/ui";`,
    propsTable: [
      {
        name: "value",
        type: "string",
        default: "undefined",
        description: "Controlled value",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        default: "undefined",
        description: "Change handler",
      },
      {
        name: "variant",
        type: '"outline" | "filled" | "glass"',
        default: '"outline"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables the select",
      },
    ],
    subComponents: [
      "Select.Trigger",
      "Select.Value (placeholder prop)",
      "Select.Content",
      "Select.Item (value: string)",
      "Select.Group",
      "Select.Label",
      "Select.Separator",
    ],
    variants: [
      {
        title: "Basic Select",
        code: '<Select onValueChange={(v) => console.log(v)}>\n  <Select.Trigger>\n    <Select.Value placeholder="Pick a framework" />\n  </Select.Trigger>\n  <Select.Content>\n    <Select.Item value="react">React</Select.Item>\n    <Select.Item value="vue">Vue</Select.Item>\n  </Select.Content>\n</Select>',
      },
    ],
  },
  checkbox: {
    name: "Checkbox",
    description:
      "Accessible checkbox with 5 visual variants, 3 sizes, color theming, indeterminate state, and error display.",
    import: `import { Checkbox } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"default" | "card" | "pill" | "subtle" | "ghost"',
        default: '"default"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"primary" | "secondary" | "success" | "warning" | "danger"',
        default: '"primary"',
        description: "Check color",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "label",
        type: "string",
        default: "undefined",
        description: "Checkbox label",
      },
      {
        name: "indeterminate",
        type: "boolean",
        default: "false",
        description: "Shows dash instead of checkmark",
      },
      {
        name: "onValueChange",
        type: "(checked: boolean) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      { title: "Default", code: '<Checkbox label="Accept terms" />' },
      {
        title: "Card Variant",
        code: '<Checkbox variant="card" label="Email notifications" description="Get notified via email" />',
      },
    ],
  },
  switch: {
    name: "Switch",
    description:
      "Toggle switch with 3 visual variants, 3 sizes, color theming, and custom thumb icons.",
    import: `import { Switch } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"solid" | "glow" | "glass"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"primary" | "secondary" | "success" | "warning" | "danger"',
        default: '"primary"',
        description: "Active color",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "label",
        type: "string",
        default: "undefined",
        description: "Label beside switch",
      },
      {
        name: "onValueChange",
        type: "(checked: boolean) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      { title: "Solid", code: '<Switch label="Enable notifications" />' },
      {
        title: "Glow",
        code: '<Switch variant="glow" color="success" label="Active" defaultChecked />',
      },
    ],
  },
  slider: {
    name: "Slider",
    description:
      "Range slider with 2 visual variants, 3 sizes, color theming, and value display.",
    import: `import { Slider } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"solid" | "glass"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"primary" | "secondary" | "success" | "warning" | "danger"',
        default: '"primary"',
        description: "Track color",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "min",
        type: "number",
        default: "0",
        description: "Minimum value",
      },
      {
        name: "max",
        type: "number",
        default: "100",
        description: "Maximum value",
      },
      {
        name: "showValue",
        type: "boolean",
        default: "false",
        description: "Display current value",
      },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Volume Slider",
        code: '<Slider label="Volume" defaultValue={50} showValue />',
      },
    ],
  },
  rating: {
    name: "Rating",
    description:
      "Star rating input with configurable max, size, color, and read-only mode.",
    import: `import { Rating } from "@runox/ui";`,
    propsTable: [
      { name: "max", type: "number", default: "5", description: "Total stars" },
      {
        name: "value",
        type: "number",
        default: "undefined",
        description: "Controlled rating",
      },
      {
        name: "readOnly",
        type: "boolean",
        default: "false",
        description: "Disables interaction",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "color",
        type: '"warning" | "primary" | "danger" | "success"',
        default: '"warning"',
        description: "Star color",
      },
      {
        name: "onChange",
        type: "(value: number) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: "<Rating defaultValue={3} onChange={(v) => console.log(v)} />",
      },
      { title: "Read Only", code: "<Rating value={4} readOnly />" },
    ],
  },
  textarea: {
    name: "Textarea",
    description:
      "Multi-line text input with 4 visual variants, 3 sizes, resize control, label, and error state.",
    import: `import { Textarea } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"outline" | "filled" | "glass" | "flushed"',
        default: '"outline"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "label",
        type: "string",
        default: "undefined",
        description: "Label above textarea",
      },
      {
        name: "error",
        type: "string",
        default: "undefined",
        description: "Error message",
      },
      {
        name: "resize",
        type: '"none" | "both" | "horizontal" | "vertical"',
        default: '"vertical"',
        description: "Resize behavior",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<Textarea label="Description" placeholder="Tell us about yourself..." rows={4} />',
      },
    ],
  },
  form: {
    name: "Form",
    description:
      "React Hook Form integration providing Field, Label, Control, Message, and validation display.",
    import: `import { Form } from "@runox/ui";`,
    propsTable: [
      {
        name: "...methods",
        type: "UseFormReturn",
        default: "required",
        description: "React Hook Form useForm() return value spread onto Form",
      },
    ],
    subComponents: [
      "Form.Field (name: FieldPath)",
      "Form.Item",
      "Form.Label",
      "Form.Control",
      "Form.Description",
      "Form.Message",
    ],
    variants: [
      {
        title: "Login Form",
        code: 'const form = useForm();\n\n<Form {...form}>\n  <Form.Field\n    control={form.control}\n    name="email"\n    render={({ field }) => (\n      <Form.Item>\n        <Form.Label>Email</Form.Label>\n        <Form.Control>\n          <Input type="email" {...field} />\n        </Form.Control>\n        <Form.Message />\n      </Form.Item>\n    )}\n  />\n  <Button type="submit">Sign In</Button>\n</Form>',
      },
    ],
  },
  card: {
    name: "Card",
    description:
      "Versatile card container with 7 visual variants, 3 sizes, interactive state, and Header/Body/Footer compound sub-components.",
    import: `import { Card } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"elevated" | "filled" | "subtle" | "bordered" | "ghost" | "glass" | "outline"',
        default: '"elevated"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Padding scale",
      },
      {
        name: "isInteractive",
        type: "boolean",
        default: "false",
        description: "Hover/focus interaction styles",
      },
    ],
    subComponents: [
      "Card.Header",
      "Card.Body",
      "Card.Footer",
      "Card.Title",
      "Card.Description",
    ],
    variants: [
      {
        title: "Glass Card",
        code: '<Card variant="glass">\n  <Card.Header>\n    <Card.Title>Glass Card</Card.Title>\n    <Card.Description>Beautiful glassmorphic design</Card.Description>\n  </Card.Header>\n  <Card.Body>\n    <p>Main content goes here.</p>\n  </Card.Body>\n  <Card.Footer>\n    <Button size="sm">Action</Button>\n  </Card.Footer>\n</Card>',
      },
    ],
  },
  badge: {
    name: "Badge",
    description:
      "Status badge with 5 variants, 3 sizes, 9 color options, pulse animation, and icon support.",
    import: `import { Badge } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"solid" | "subtle" | "outline" | "glass" | "gradient"',
        default: '"subtle"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"primary" | "ai" | "info" | "success" | "warning" | "danger"',
        default: '"primary"',
        description: "Color palette",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "shape",
        type: '"circle" | "square" | "rounded"',
        default: '"rounded"',
        description: "Badge shape",
      },
      {
        name: "pulse",
        type: "boolean",
        default: "false",
        description: "Animated pulse ring",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Status",
        code: '<Badge color="success" variant="solid">Active</Badge>',
      },
      {
        title: "AI Badge",
        code: '<Badge color="ai" variant="gradient" pulse>AI</Badge>',
      },
    ],
  },
  avatar: {
    name: "Avatar",
    description:
      "User avatar with image, initials fallback, 3 variants, 4 sizes, 3 shapes, and presence status.",
    import: `import { Avatar } from "@runox/ui";`,
    propsTable: [
      {
        name: "src",
        type: "string",
        default: "undefined",
        description: "Image URL",
      },
      {
        name: "alt",
        type: "string",
        default: "undefined",
        description: "Alt text / initials fallback",
      },
      {
        name: "variant",
        type: '"solid" | "ringed" | "glass"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg" | "xl"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "status",
        type: '"online" | "offline" | "busy" | "away"',
        default: "undefined",
        description: "Presence indicator",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "With Image",
        code: '<Avatar src="/user.jpg" alt="John Doe" size="lg" status="online" />',
      },
    ],
  },
  alert: {
    name: "Alert",
    description:
      "Feedback alert with 5 variants, 3 sizes, 8 color options, icon slot, and dismissible close button.",
    import: `import { Alert } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"subtle" | "solid" | "glass" | "left-accent" | "top-accent"',
        default: '"subtle"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"info" | "success" | "warning" | "danger" | "primary"',
        default: '"info"',
        description: "Color palette",
      },
      {
        name: "title",
        type: "string",
        default: "undefined",
        description: "Bold alert title",
      },
      {
        name: "onClose",
        type: "() => void",
        default: "undefined",
        description: "Shows close button",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Success",
        code: '<Alert color="success" variant="solid" title="Saved!">Your changes have been saved.</Alert>',
      },
      {
        title: "Warning Accent",
        code: '<Alert color="warning" variant="left-accent" title="Heads up">This cannot be undone.</Alert>',
      },
    ],
  },
  toast: {
    name: "Toast",
    description:
      "Non-blocking notifications with 4 variants, 3 sizes, 6 positions, and programmatic API via Toast.useToast hook.",
    import: `import { Toast } from "@runox/ui";`,
    propsTable: [
      {
        name: "position",
        type: '"top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center"',
        default: '"bottom-right"',
        description: "Provider-level position",
      },
    ],
    subComponents: [
      "Toast.Provider — wraps app, required",
      "Toast.useToast — hook returning { toast, dismiss }",
      "Toast.STICKY — pass as duration for persistent toasts",
    ],
    variants: [
      {
        title: "Setup",
        code: '// In root layout:\n<RunoxProvider toastPosition="top-right">{children}</RunoxProvider>',
      },
      {
        title: "Fire a Toast",
        code: 'const { toast } = Toast.useToast();\n\ntoast({\n  title: "Saved!",\n  description: "Your changes have been saved.",\n  variant: "success",\n  duration: 3000,\n});',
      },
    ],
  },
  modal: {
    name: "Modal",
    description:
      "Accessible dialog with 3 variants, 5 sizes, mobile bottom-sheet mode, and compound sub-components.",
    import: `import { Modal } from "@runox/ui";`,
    propsTable: [
      {
        name: "open",
        type: "boolean",
        default: "undefined",
        description: "Controlled open state",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        default: "undefined",
        description: "State change handler",
      },
      {
        name: "variant",
        type: '"solid" | "glass" | "blur"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg" | "xl" | "full"',
        default: '"md"',
        description: "Dialog width",
      },
      {
        name: "mobileVariant",
        type: '"default" | "bottom-sheet"',
        default: '"default"',
        description: "Mobile layout",
      },
      {
        name: "dismissible",
        type: "boolean",
        default: "true",
        description: "Close on backdrop click",
      },
    ],
    subComponents: ["Modal.Header", "Modal.Body", "Modal.Footer"],
    variants: [
      {
        title: "Controlled Modal",
        code: 'const [open, setOpen] = useState(false);\n\n<>\n  <Button onClick={() => setOpen(true)}>Open</Button>\n  <Modal open={open} onOpenChange={setOpen}>\n    <Modal.Header>Confirm Action</Modal.Header>\n    <Modal.Body>\n      <p>Are you sure?</p>\n    </Modal.Body>\n    <Modal.Footer>\n      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>\n      <Button color="danger">Delete</Button>\n    </Modal.Footer>\n  </Modal>\n</>',
      },
    ],
  },
  drawer: {
    name: "Drawer",
    description:
      "Side-panel drawer with 3 variants, 4 positions, 4 sizes, draggable snap-points.",
    import: `import { Drawer } from "@runox/ui";`,
    propsTable: [
      {
        name: "open",
        type: "boolean",
        default: "undefined",
        description: "Controlled open state",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        default: "undefined",
        description: "State change handler",
      },
      {
        name: "variant",
        type: '"solid" | "glass" | "blur"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "position",
        type: '"left" | "right" | "top" | "bottom"',
        default: '"right"',
        description: "Slide-in direction",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg" | "full"',
        default: '"md"',
        description: "Width/height",
      },
      {
        name: "isDraggable",
        type: "boolean",
        default: "false",
        description: "Enable drag-to-close",
      },
    ],
    subComponents: [
      "Drawer.Header",
      "Drawer.Footer",
      "Drawer.Title",
      "Drawer.Description",
    ],
    variants: [
      {
        title: "Right Drawer",
        code: '<Drawer open={open} onOpenChange={setOpen} position="right">\n  <Drawer.Header><Drawer.Title>Settings</Drawer.Title></Drawer.Header>\n  <p className="p-4">Content here</p>\n</Drawer>',
      },
    ],
  },
  accordion: {
    name: "Accordion",
    description:
      "Collapsible accordion with 5 visual variants, single/multiple expansion, and keyboard navigation.",
    import: `import { Accordion } from "@runox/ui";`,
    propsTable: [
      {
        name: "type",
        type: '"single" | "multiple"',
        default: '"single"',
        description: "Expansion mode",
      },
      {
        name: "variant",
        type: '"default" | "separated" | "bordered" | "filled" | "glass"',
        default: '"default"',
        description: "Visual style",
      },
      {
        name: "collapsible",
        type: "boolean",
        default: "true",
        description: "Allow collapsing all items",
      },
    ],
    subComponents: [
      "Accordion.Item (value: string)",
      "Accordion.Trigger",
      "Accordion.Content",
    ],
    variants: [
      {
        title: "FAQ",
        code: '<Accordion type="single" collapsible>\n  <Accordion.Item value="q1">\n    <Accordion.Trigger>What is Runox UI?</Accordion.Trigger>\n    <Accordion.Content>An AI-native React component library.</Accordion.Content>\n  </Accordion.Item>\n</Accordion>',
      },
    ],
  },
  tabs: {
    name: "Tabs",
    description:
      "Tab navigation with 5 visual variants, 3 sizes, and keyboard navigation.",
    import: `import { Tabs } from "@runox/ui";`,
    propsTable: [
      {
        name: "defaultValue",
        type: "string",
        default: "undefined",
        description: "Initial active tab",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        default: "undefined",
        description: "Tab change handler",
      },
      {
        name: "variant",
        type: '"default" | "underline" | "pills" | "bordered" | "glass"',
        default: '"default"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
    ],
    subComponents: [
      "Tabs.List",
      "Tabs.Trigger (value: string)",
      "Tabs.Content (value: string)",
    ],
    variants: [
      {
        title: "Default Tabs",
        code: '<Tabs defaultValue="overview">\n  <Tabs.List>\n    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>\n    <Tabs.Trigger value="details">Details</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="overview"><p>Overview content</p></Tabs.Content>\n  <Tabs.Content value="details"><p>Details content</p></Tabs.Content>\n</Tabs>',
      },
    ],
  },
  tooltip: {
    name: "Tooltip",
    description:
      "Floating tooltip with 4 variants, 3 sizes, 4 positions, arrow, and configurable delay.",
    import: `import { Tooltip } from "@runox/ui";`,
    propsTable: [
      {
        name: "content",
        type: "React.ReactNode",
        default: "required",
        description: "Tooltip content",
      },
      {
        name: "variant",
        type: '"solid" | "glass" | "subtle" | "inverted"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "position",
        type: '"top" | "right" | "bottom" | "left"',
        default: '"top"',
        description: "Placement",
      },
      {
        name: "delay",
        type: "number",
        default: "400",
        description: "Open delay in ms",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<Tooltip content="Copy to clipboard">\n  <Button variant="ghost"><Copy size={16} /></Button>\n</Tooltip>',
      },
    ],
  },
  popover: {
    name: "Popover",
    description:
      "Floating popover panel with 3 variants, 3 sizes, optional arrow, and trigger/content API.",
    import: `import { Popover } from "@runox/ui";`,
    propsTable: [
      {
        name: "trigger",
        type: "React.ReactNode",
        default: "required",
        description: "Trigger element",
      },
      {
        name: "variant",
        type: '"solid" | "glass" | "tooltip"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "align",
        type: '"start" | "center" | "end"',
        default: '"center"',
        description: "Alignment relative to trigger",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<Popover trigger={<Button>Open</Button>}>\n  <p className="p-3">Popover content.</p>\n</Popover>',
      },
    ],
  },
  table: {
    name: "Table",
    description:
      "Semantic HTML table with 4 variants, 3 sizes. Pair with DataTable for advanced data-grid features.",
    import: `import { Table, DataTable, useDataTable } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"default" | "striped" | "glass" | "ghost"',
        default: '"default"',
        description: "Visual style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Row density",
      },
    ],
    subComponents: [
      "Table.Header",
      "Table.Body",
      "Table.Footer",
      "Table.Row",
      "Table.Head",
      "Table.Cell",
      "Table.Caption",
      "DataTable — advanced grid with sorting, filtering, pagination",
    ],
    variants: [
      {
        title: "Striped Table",
        code: '<Table variant="striped">\n  <Table.Header>\n    <Table.Row>\n      <Table.Head>Name</Table.Head>\n      <Table.Head>Status</Table.Head>\n    </Table.Row>\n  </Table.Header>\n  <Table.Body>\n    <Table.Row>\n      <Table.Cell>Alice</Table.Cell>\n      <Table.Cell><Badge color="success">Active</Badge></Table.Cell>\n    </Table.Row>\n  </Table.Body>\n</Table>',
      },
    ],
  },
  progress: {
    name: "Progress",
    description:
      "Progress bar with 4 variants (including striped and indeterminate), 3 sizes, 4 colors.",
    import: `import { Progress } from "@runox/ui";`,
    propsTable: [
      {
        name: "value",
        type: "number",
        default: "0",
        description: "Current value 0 to max",
      },
      {
        name: "max",
        type: "number",
        default: "100",
        description: "Maximum value",
      },
      {
        name: "variant",
        type: '"solid" | "striped" | "indeterminate" | "glass"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "color",
        type: '"primary" | "success" | "warning" | "danger"',
        default: '"primary"',
        description: "Fill color",
      },
      {
        name: "showValue",
        type: "boolean",
        default: "false",
        description: "Show numeric label",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Determinate",
        code: '<Progress value={65} color="success" showValue />',
      },
      { title: "Indeterminate", code: '<Progress variant="indeterminate" />' },
    ],
  },
  pagination: {
    name: "Pagination",
    description:
      "Page navigation with 4 variants, 3 sizes, ellipsis support, and sibling count.",
    import: `import { Pagination } from "@runox/ui";`,
    propsTable: [
      {
        name: "currentPage",
        type: "number",
        default: "required",
        description: "Active page (1-indexed)",
      },
      {
        name: "totalPages",
        type: "number",
        default: "required",
        description: "Total pages",
      },
      {
        name: "onPageChange",
        type: "(page: number) => void",
        default: "required",
        description: "Page change handler",
      },
      {
        name: "variant",
        type: '"default" | "pills" | "bordered" | "glass"',
        default: '"default"',
        description: "Visual style",
      },
    ],
    subComponents: [
      "Pagination.Previous",
      "Pagination.Next",
      "Pagination.Link",
      "Pagination.Ellipsis",
    ],
    variants: [
      {
        title: "Basic",
        code: "<Pagination currentPage={page} totalPages={20} onPageChange={setPage} />",
      },
    ],
  },
  breadcrumb: {
    name: "Breadcrumb",
    description:
      "Navigation trail with 3 variants, 3 sizes, and custom separator.",
    import: `import { Breadcrumb } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"default" | "pills" | "glass"',
        default: '"default"',
        description: "Visual style",
      },
      {
        name: "separator",
        type: "React.ReactNode",
        default: "ChevronRight",
        description: "Custom separator",
      },
    ],
    subComponents: [
      "Breadcrumb.Root",
      "Breadcrumb.List",
      "Breadcrumb.Item",
      "Breadcrumb.Link",
      "Breadcrumb.Page",
      "Breadcrumb.Separator",
    ],
    variants: [
      {
        title: "Basic",
        code: '<Breadcrumb>\n  <Breadcrumb.Root>\n    <Breadcrumb.List>\n      <Breadcrumb.Item><Breadcrumb.Link href="/">Home</Breadcrumb.Link></Breadcrumb.Item>\n      <Breadcrumb.Separator />\n      <Breadcrumb.Item><Breadcrumb.Page>Docs</Breadcrumb.Page></Breadcrumb.Item>\n    </Breadcrumb.List>\n  </Breadcrumb.Root>\n</Breadcrumb>',
      },
    ],
  },
  stepper: {
    name: "Stepper",
    description:
      "Multi-step progress indicator with 3 variants, 3 sizes, horizontal/vertical orientation.",
    import: `import { Stepper } from "@runox/ui";`,
    propsTable: [
      {
        name: "steps",
        type: "{ title: string; description?: string; status?: string }[]",
        default: "required",
        description: "Step definitions",
      },
      {
        name: "currentStep",
        type: "number",
        default: "required",
        description: "Zero-indexed current step",
      },
      {
        name: "variant",
        type: '"circles" | "dots" | "pills"',
        default: '"circles"',
        description: "Visual style",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "Layout direction",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<Stepper\n  currentStep={1}\n  steps={[\n    { title: "Account" },\n    { title: "Profile" },\n    { title: "Done" },\n  ]}\n/>',
      },
    ],
  },
  ai: {
    name: "AI",
    description:
      "AI interaction components: AI.Input for prompts, AI.ChatBubble for conversations, AI.StreamingText for animated text reveal.",
    import: `import { AI } from "@runox/ui";`,
    propsTable: [],
    subComponents: [
      "AI.Input — auto-expanding prompt textarea (onValueSubmit, onAttach, onMic, variant)",
      "AI.ChatBubble — conversation bubble (speaker: 'user'|'assistant'|'system', variant)",
      "AI.StreamingText — character-by-character reveal (text, speed, cursor, onComplete)",
    ],
    variants: [
      {
        title: "AI Input",
        code: '<AI.Input\n  placeholder="Ask me anything..."\n  onValueSubmit={(value) => console.log(value)}\n  onAttach={() => {}}\n/>',
      },
      {
        title: "Chat Bubble",
        code: '<AI.ChatBubble speaker="assistant" variant="glass">\n  Hello! How can I help you today?\n</AI.ChatBubble>',
      },
      {
        title: "Streaming Text",
        code: '<AI.StreamingText\n  text="I\'m generating your response..."\n  speed={15}\n  cursor="glow"\n  onComplete={() => console.log(\'done\')}\n/>',
      },
      {
        title: "Full Chat UI",
        code: '<Flex direction="col" gap="md">\n  <AI.ChatBubble speaker="user">What is Runox UI?</AI.ChatBubble>\n  <AI.ChatBubble speaker="assistant">\n    <AI.StreamingText text="Runox UI is an AI-native React component library." />\n  </AI.ChatBubble>\n  <AI.Input onValueSubmit={handleSubmit} />\n</Flex>',
      },
    ],
  },
  runoxprovider: {
    name: "RunoxProvider",
    description:
      "Root provider combining ThemeProvider + Toast.Provider + MakeWayProvider. Place at app root.",
    import: `import { RunoxProvider } from "@runox/ui";`,
    propsTable: [
      {
        name: "defaultTheme",
        type: '"light" | "dark" | "system"',
        default: '"system"',
        description: "Initial theme mode",
      },
      {
        name: "tokens",
        type: "RunoxTheme",
        default: "undefined",
        description: "Custom design token overrides",
      },
      {
        name: "toastPosition",
        type: "string",
        default: '"bottom-right"',
        description: "Global toast position",
      },
      {
        name: "defaultConfig",
        type: "{ density?: string; radius?: string }",
        default: "undefined",
        description: "Layout defaults",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic Setup",
        code: 'import { RunoxProvider } from "@runox/ui";\nimport "@runox/ui/styles.css";\n\nexport default function RootLayout({ children }) {\n  return (\n    <html><body>\n      <RunoxProvider defaultTheme="system">\n        {children}\n      </RunoxProvider>\n    </body></html>\n  );\n}',
      },
      {
        title: "Custom Theme",
        code: '<RunoxProvider\n  defaultTheme="dark"\n  tokens={{ primaryColor: "#7c3aed", radius: "lg" }}\n  toastPosition="top-right"\n>\n  {children}\n</RunoxProvider>',
      },
    ],
  },
  motion: {
    name: "Motion",
    description:
      "Animation entrance primitives. Motion.Stagger orchestrates child animations with staggered delays.",
    import: `import { Motion } from "@runox/ui";`,
    propsTable: [
      {
        name: "delay",
        type: "number",
        default: "0",
        description: "Animation delay in ms",
      },
      {
        name: "duration",
        type: "number",
        default: "400",
        description: "Animation duration in ms",
      },
    ],
    subComponents: [
      "Motion.FadeIn",
      "Motion.ScaleIn",
      "Motion.SlideIn (direction: 'up'|'down'|'left'|'right')",
      "Motion.ZoomIn",
      "Motion.FlipIn",
      "Motion.BounceIn",
      "Motion.RotateIn",
      "Motion.Shake",
      "Motion.Reveal",
      "Motion.Stagger (staggerDelay?)",
    ],
    variants: [
      {
        title: "Fade In",
        code: "<Motion.FadeIn delay={200}>\n  <Card>Hello world</Card>\n</Motion.FadeIn>",
      },
      {
        title: "Staggered List",
        code: "<Motion.Stagger staggerDelay={100}>\n  {items.map(item => (\n    <Motion.FadeIn key={item.id}>\n      <Card>{item.name}</Card>\n    </Motion.FadeIn>\n  ))}\n</Motion.Stagger>",
      },
    ],
  },
  dropdown: {
    name: "Dropdown",
    description:
      "Multi-select or single-select dropdown with search, empty state, and groups.",
    import: `import { Dropdown } from "@runox/ui";`,
    propsTable: [
      {
        name: "value",
        type: "string | string[]",
        default: "undefined",
        description: "Controlled value(s)",
      },
      {
        name: "onValueChange",
        type: "(val: string | string[]) => void",
        default: "undefined",
        description: "Change handler",
      },
      {
        name: "multiple",
        type: "boolean",
        default: "false",
        description: "Multi-select mode",
      },
    ],
    subComponents: [
      "Dropdown.Trigger",
      "Dropdown.Content",
      "Dropdown.Item",
      "Dropdown.Search",
      "Dropdown.Group",
    ],
    variants: [
      {
        title: "Basic",
        code: '<Dropdown onValueChange={setValue}>\n  <Dropdown.Trigger>Select option</Dropdown.Trigger>\n  <Dropdown.Content>\n    <Dropdown.Item value="a">Option A</Dropdown.Item>\n    <Dropdown.Item value="b">Option B</Dropdown.Item>\n  </Dropdown.Content>\n</Dropdown>',
      },
    ],
  },
  command: {
    name: "Command",
    description:
      "Command palette with search, grouped items, empty state, and keyboard shortcuts.",
    import: `import { Command } from "@runox/ui";`,
    propsTable: [],
    subComponents: [
      "Command.Dialog",
      "Command.Input",
      "Command.List",
      "Command.Empty",
      "Command.Group",
      "Command.Item",
      "Command.Shortcut",
    ],
    variants: [
      {
        title: "Palette",
        code: '<Command.Dialog open={open} onOpenChange={setOpen}>\n  <Command.Input placeholder="Search..." />\n  <Command.List>\n    <Command.Empty>No results.</Command.Empty>\n    <Command.Group heading="Actions">\n      <Command.Item onSelect={() => {}}>Create new <Command.Shortcut>N</Command.Shortcut></Command.Item>\n    </Command.Group>\n  </Command.List>\n</Command.Dialog>',
      },
    ],
  },
  skeleton: {
    name: "Skeleton",
    description:
      "Loading placeholder with 4 shape variants and 3 animation modes.",
    import: `import { Skeleton } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"text" | "circular" | "rectangular" | "rounded"',
        default: '"text"',
        description: "Shape",
      },
      {
        name: "animation",
        type: '"shimmer" | "pulse" | "none"',
        default: '"shimmer"',
        description: "Loading animation",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Text Lines",
        code: '<Flex direction="col" gap="sm">\n  <Skeleton variant="text" width="80%" />\n  <Skeleton variant="text" width="60%" />\n</Flex>',
      },
      {
        title: "Avatar",
        code: '<Skeleton variant="circular" width={48} height={48} />',
      },
    ],
  },
  spinner: {
    name: "Spinner",
    description: "SVG loading spinner with 4 sizes and 10 color options.",
    import: `import { Spinner } from "@runox/ui";`,
    propsTable: [
      {
        name: "size",
        type: '"sm" | "md" | "lg" | "xl"',
        default: '"md"',
        description: "Spinner size",
      },
      {
        name: "color",
        type: '"current" | "primary" | "secondary" | "success" | "warning" | "danger"',
        default: '"primary"',
        description: "Color",
      },
    ],
    subComponents: [],
    variants: [
      { title: "Basic", code: '<Spinner size="md" color="primary" />' },
    ],
  },
  chart: {
    name: "Chart",
    description:
      "Chart components for Line, Bar, Area, and Pie charts built on Recharts.",
    import: `import { Chart } from "@runox/ui";`,
    propsTable: [
      {
        name: "data",
        type: "Record<string, unknown>[]",
        default: "required",
        description: "Chart data",
      },
      {
        name: "index",
        type: "string",
        default: "required",
        description: "X-axis key",
      },
      {
        name: "categories",
        type: "string[]",
        default: "required",
        description: "Data series keys",
      },
    ],
    subComponents: ["Chart.Line", "Chart.Bar", "Chart.Area", "Chart.Pie"],
    variants: [
      {
        title: "Line Chart",
        code: '<Chart.Line\n  data={[{ month: "Jan", sales: 400 }, { month: "Feb", sales: 800 }]}\n  index="month"\n  categories={["sales"]}\n/>',
      },
    ],
  },
  kanban: {
    name: "Kanban",
    description: "Drag-and-drop Kanban board with sortable columns and cards.",
    import: `import { Kanban } from "@runox/ui";`,
    propsTable: [
      {
        name: "onCardMove",
        type: "(activeId, overId, overColId, position) => void",
        default: "required",
        description: "Called when a card is dropped",
      },
    ],
    subComponents: [
      "Kanban.Column (id)",
      "Kanban.ColumnHeader (count?)",
      "Kanban.Card (id)",
    ],
    variants: [
      {
        title: "Basic Board",
        code: '<Kanban onCardMove={handleMove}>\n  <Kanban.Column id="todo">\n    <Kanban.ColumnHeader count={2}>To Do</Kanban.ColumnHeader>\n    <Kanban.Card id="1">Task 1</Kanban.Card>\n  </Kanban.Column>\n</Kanban>',
      },
    ],
  },
  sidebar: {
    name: "Sidebar",
    description:
      "Navigation sidebar with 3 variants, collapse, mobile overlay, and nav item sub-components.",
    import: `import { Sidebar } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"solid" | "glass" | "floating"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "collapsed",
        type: "boolean",
        default: "false",
        description: "Icon-only mode",
      },
    ],
    subComponents: [
      "Sidebar.Header",
      "Sidebar.Content",
      "Sidebar.Footer",
      "Sidebar.Item (href, icon, active)",
      "Sidebar.MobileToggle",
    ],
    variants: [
      {
        title: "Basic",
        code: '<Sidebar variant="solid">\n  <Sidebar.Header>Logo</Sidebar.Header>\n  <Sidebar.Content>\n    <Sidebar.Item href="/" icon={<Home />} active>Dashboard</Sidebar.Item>\n  </Sidebar.Content>\n</Sidebar>',
      },
    ],
  },
  colorpicker: {
    name: "ColorPicker",
    description:
      "Color picker input with popover, hex input, swatch palette, and 4 visual variants.",
    import: `import { ColorPicker } from "@runox/ui";`,
    propsTable: [
      {
        name: "value",
        type: "string",
        default: "undefined",
        description: "Controlled hex color",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        default: "undefined",
        description: "Change handler",
      },
      {
        name: "variant",
        type: '"outline" | "filled" | "glass" | "subtle"',
        default: '"outline"',
        description: "Visual style",
      },
      {
        name: "swatches",
        type: "string[]",
        default: "undefined",
        description: "Preset color swatches",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "With Swatches",
        code: '<ColorPicker\n  value={color}\n  onChange={setColor}\n  swatches={["#ff0000", "#00ff00", "#0000ff"]}\n/>',
      },
    ],
  },
  otpinput: {
    name: "OtpInput",
    description:
      "One-time password input with 4 variants, configurable length, and password masking.",
    import: `import { OtpInput } from "@runox/ui";`,
    propsTable: [
      {
        name: "length",
        type: "number",
        default: "6",
        description: "Number of input boxes",
      },
      {
        name: "variant",
        type: '"boxed" | "underline" | "pill" | "glass"',
        default: '"boxed"',
        description: "Visual style",
      },
      {
        name: "isPassword",
        type: "boolean",
        default: "false",
        description: "Mask digits",
      },
      {
        name: "onChange",
        type: "(value: string) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Boxed",
        code: "<OtpInput length={6} onChange={(val) => console.log(val)} />",
      },
    ],
  },
  taginput: {
    name: "TagInput",
    description:
      "Tag/chip input with variant-matched container and 4 tag visual styles.",
    import: `import { TagInput } from "@runox/ui";`,
    propsTable: [
      {
        name: "value",
        type: "string[]",
        default: "undefined",
        description: "Controlled tag list",
      },
      {
        name: "onChange",
        type: "(tags: string[]) => void",
        default: "undefined",
        description: "Change handler",
      },
      {
        name: "tagVariant",
        type: '"subtle" | "solid" | "outline" | "glass"',
        default: '"subtle"',
        description: "Tag chip style",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<TagInput placeholder="Add a tag..." onChange={setTags} />',
      },
    ],
  },
  numberinput: {
    name: "NumberInput",
    description: "Numeric input with +/- controls, min/max/step constraints.",
    import: `import { NumberInput } from "@runox/ui";`,
    propsTable: [
      {
        name: "min",
        type: "number",
        default: "undefined",
        description: "Minimum allowed value",
      },
      {
        name: "max",
        type: "number",
        default: "undefined",
        description: "Maximum allowed value",
      },
      {
        name: "step",
        type: "number",
        default: "1",
        description: "Increment step",
      },
      {
        name: "onChange",
        type: "(value: number) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Quantity",
        code: '<NumberInput label="Quantity" min={1} max={100} defaultValue={1} />',
      },
    ],
  },
  passwordinput: {
    name: "PasswordInput",
    description:
      "Password input with visibility toggle and validation messages.",
    import: `import { PasswordInput } from "@runox/ui";`,
    propsTable: [
      {
        name: "label",
        type: "string",
        default: "undefined",
        description: "Label",
      },
      {
        name: "error",
        type: "string",
        default: "undefined",
        description: "Error message",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<PasswordInput label="Password" placeholder="Enter password" />',
      },
    ],
  },
  fileuploader: {
    name: "FileUploader",
    description:
      "Drag-and-drop file uploader with progress tracking and file validation.",
    import: `import { FileUploader } from "@runox/ui";`,
    propsTable: [
      {
        name: "onFilesChange",
        type: "(files: File[]) => void",
        default: "undefined",
        description: "File change handler",
      },
      {
        name: "accept",
        type: "string",
        default: "undefined",
        description: "MIME type filter",
      },
      {
        name: "multiple",
        type: "boolean",
        default: "false",
        description: "Allow multiple files",
      },
      {
        name: "maxSize",
        type: "number",
        default: "undefined",
        description: "Max file size in bytes",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Image Upload",
        code: '<FileUploader\n  accept="image/*"\n  multiple\n  maxFiles={5}\n  onFilesChange={(files) => console.log(files)}\n/>',
      },
    ],
  },
  signaturepad: {
    name: "SignaturePad",
    description:
      "Canvas signature capture with typed fallback and data URL export.",
    import: `import { SignaturePad } from "@runox/ui";`,
    propsTable: [
      {
        name: "penColor",
        type: "string",
        default: '"#000"',
        description: "Stroke color",
      },
      {
        name: "height",
        type: "number",
        default: "200",
        description: "Canvas height",
      },
      {
        name: "onEnd",
        type: "(dataUrl: string) => void",
        default: "undefined",
        description: "Stroke end handler",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: "<SignaturePad onEnd={(url) => setSig(url)} showClearButton />",
      },
    ],
  },
  hovercard: {
    name: "HoverCard",
    description: "Hover-triggered floating card with configurable delays.",
    import: `import { HoverCard } from "@runox/ui";`,
    propsTable: [
      {
        name: "trigger",
        type: "React.ReactNode",
        default: "required",
        description: "Trigger element",
      },
      {
        name: "variant",
        type: '"solid" | "glass"',
        default: '"solid"',
        description: "Visual style",
      },
      {
        name: "openDelay",
        type: "number",
        default: "300",
        description: "Open delay ms",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "User Profile",
        code: '<HoverCard trigger={<span className="underline cursor-pointer">@johndoe</span>}>\n  <div className="p-3">John Doe — Frontend Engineer</div>\n</HoverCard>',
      },
    ],
  },
  alertdialog: {
    name: "AlertDialog",
    description: "Confirmation dialog that blocks until user responds.",
    import: `import { AlertDialog } from "@runox/ui";`,
    propsTable: [
      {
        name: "open",
        type: "boolean",
        default: "undefined",
        description: "Controlled open state",
      },
    ],
    subComponents: [
      "AlertDialog.Trigger",
      "AlertDialog.Content",
      "AlertDialog.Title",
      "AlertDialog.Description",
      "AlertDialog.Action",
      "AlertDialog.Cancel",
    ],
    variants: [
      {
        title: "Delete Confirm",
        code: '<AlertDialog>\n  <AlertDialog.Trigger asChild><Button color="danger">Delete</Button></AlertDialog.Trigger>\n  <AlertDialog.Content>\n    <AlertDialog.Title>Are you sure?</AlertDialog.Title>\n    <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>\n    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>\n    <AlertDialog.Action>Delete</AlertDialog.Action>\n  </AlertDialog.Content>\n</AlertDialog>',
      },
    ],
  },
  contextmenu: {
    name: "ContextMenu",
    description:
      "Right-click context menu with checkbox items, radio groups, and sub-menus.",
    import: `import { ContextMenu } from "@runox/ui";`,
    propsTable: [],
    subComponents: [
      "ContextMenu.Trigger",
      "ContextMenu.Content",
      "ContextMenu.Item",
      "ContextMenu.Separator",
      "ContextMenu.Sub",
    ],
    variants: [
      {
        title: "Basic",
        code: '<ContextMenu>\n  <ContextMenu.Trigger><div className="p-8 border">Right-click here</div></ContextMenu.Trigger>\n  <ContextMenu.Content>\n    <ContextMenu.Item>Edit</ContextMenu.Item>\n    <ContextMenu.Separator />\n    <ContextMenu.Item>Delete</ContextMenu.Item>\n  </ContextMenu.Content>\n</ContextMenu>',
      },
    ],
  },
  timeline: {
    name: "Timeline",
    description:
      "Vertical or horizontal timeline with step statuses and connector lines.",
    import: `import { Timeline } from "@runox/ui";`,
    propsTable: [
      {
        name: "orientation",
        type: '"vertical" | "horizontal"',
        default: '"vertical"',
        description: "Layout direction",
      },
    ],
    subComponents: [
      "Timeline.Item",
      "Timeline.Dot (status)",
      "Timeline.Connector",
      "Timeline.Content",
    ],
    variants: [
      {
        title: "Vertical",
        code: '<Timeline>\n  <Timeline.Item>\n    <Timeline.Dot status="completed" />\n    <Timeline.Content><Text weight="semibold">Order Placed</Text></Timeline.Content>\n  </Timeline.Item>\n  <Timeline.Item>\n    <Timeline.Dot status="active" />\n    <Timeline.Content><Text>Shipped</Text></Timeline.Content>\n  </Timeline.Item>\n</Timeline>',
      },
    ],
  },
  calendar: {
    name: "Calendar",
    description:
      "Date picker supporting single, multiple, and range selection, with optional time picker.",
    import: `import { Calendar } from "@runox/ui";`,
    propsTable: [
      {
        name: "mode",
        type: '"single" | "multiple" | "range" | "time"',
        default: '"single"',
        description: "Selection mode",
      },
      {
        name: "value",
        type: "Date | Date[] | DateRange",
        default: "undefined",
        description: "Controlled value",
      },
      {
        name: "onValueChange",
        type: "(value) => void",
        default: "undefined",
        description: "Change handler",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Single Date",
        code: '<Calendar mode="single" value={date} onValueChange={setDate} />',
      },
      {
        title: "Date Range",
        code: '<Calendar mode="range" value={range} onValueChange={setRange} />',
      },
    ],
  },
  carousel: {
    name: "Carousel",
    description:
      "Embla-powered carousel with slide/fade/flip effects and navigation controls.",
    import: `import { Carousel } from "@runox/ui";`,
    propsTable: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "Scroll direction",
      },
      {
        name: "effect",
        type: '"slide" | "fade" | "flip"',
        default: '"slide"',
        description: "Transition effect",
      },
    ],
    subComponents: [
      "Carousel.Content",
      "Carousel.Item",
      "Carousel.Previous",
      "Carousel.Next",
      "Carousel.Dots",
    ],
    variants: [
      {
        title: "Basic",
        code: '<Carousel>\n  <Carousel.Content>\n    <Carousel.Item><img src="/slide1.jpg" /></Carousel.Item>\n    <Carousel.Item><img src="/slide2.jpg" /></Carousel.Item>\n  </Carousel.Content>\n  <Carousel.Previous />\n  <Carousel.Next />\n</Carousel>',
      },
    ],
  },
  sortablelist: {
    name: "SortableList",
    description: "Drag-to-reorder list with vertical/horizontal directions.",
    import: `import { SortableList } from "@runox/ui";`,
    propsTable: [
      {
        name: "items",
        type: "T[]",
        default: "required",
        description: "Items to sort",
      },
      {
        name: "onSortEnd",
        type: "(items: T[]) => void",
        default: "required",
        description: "Called after drag completes",
      },
      {
        name: "renderItem",
        type: "(item: T, isDragging: boolean) => ReactNode",
        default: "required",
        description: "Row renderer",
      },
      {
        name: "keyExtractor",
        type: "(item: T) => string",
        default: "required",
        description: "Unique key per item",
      },
    ],
    subComponents: ["SortableList.DragHandle"],
    variants: [
      {
        title: "Basic",
        code: '<SortableList\n  items={tasks}\n  keyExtractor={(t) => t.id}\n  onSortEnd={setTasks}\n  renderItem={(task, isDragging) => (\n    <div className={isDragging ? "opacity-50" : ""}>\n      <SortableList.DragHandle />\n      {task.title}\n    </div>\n  )}\n/>',
      },
    ],
  },
  treeview: {
    name: "TreeView",
    description:
      "Hierarchical tree view with folders, leaf items, and selection/expansion state.",
    import: `import { TreeView } from "@runox/ui";`,
    propsTable: [
      {
        name: "selectedId",
        type: "string | null",
        default: "undefined",
        description: "Controlled selected node",
      },
      {
        name: "onValueChange",
        type: "(id: string) => void",
        default: "undefined",
        description: "Selection handler",
      },
    ],
    subComponents: [
      "TreeView.Folder (value, label, icon)",
      "TreeView.Item (value, label, icon)",
    ],
    variants: [
      {
        title: "File Tree",
        code: '<TreeView onValueChange={setSelected}>\n  <TreeView.Folder value="src" label="src">\n    <TreeView.Item value="index" label="index.ts" />\n  </TreeView.Folder>\n</TreeView>',
      },
    ],
  },
  virtuallist: {
    name: "VirtualList",
    description:
      "Virtualized list for large datasets — only renders visible rows.",
    import: `import { VirtualList } from "@runox/ui";`,
    propsTable: [
      {
        name: "items",
        type: "T[]",
        default: "required",
        description: "Full data array",
      },
      {
        name: "renderItem",
        type: "(item: T, index: number) => ReactNode",
        default: "required",
        description: "Row renderer",
      },
      {
        name: "itemHeight",
        type: "number",
        default: "required",
        description: "Fixed row height px",
      },
      {
        name: "height",
        type: "string | number",
        default: '"400px"',
        description: "Container height",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "1000 Items",
        code: '<VirtualList\n  items={bigList}\n  renderItem={(item) => <div className="p-2">{item.name}</div>}\n  itemHeight={48}\n  height={500}\n/>',
      },
    ],
  },
  separator: {
    name: "Separator",
    description:
      "Visual divider with 3 line styles and horizontal/vertical orientation.",
    import: `import { Separator } from "@runox/ui";`,
    propsTable: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "Direction",
      },
      {
        name: "variant",
        type: '"solid" | "dashed" | "dotted"',
        default: '"solid"',
        description: "Line style",
      },
    ],
    subComponents: [],
    variants: [
      { title: "Horizontal", code: "<Separator />" },
      { title: "Dashed", code: '<Separator variant="dashed" />' },
    ],
  },
  resizable: {
    name: "Resizable",
    description:
      "Drag-to-resize panel layouts with PanelGroup, Panel, and Handle.",
    import: `import { Resizable } from "@runox/ui";`,
    propsTable: [],
    subComponents: [
      "Resizable.PanelGroup (direction: 'horizontal'|'vertical')",
      "Resizable.Panel (defaultSize, minSize, maxSize)",
      "Resizable.Handle (withHandle?)",
    ],
    variants: [
      {
        title: "Split Layout",
        code: '<Resizable.PanelGroup direction="horizontal">\n  <Resizable.Panel defaultSize={30} minSize={20}><div>Sidebar</div></Resizable.Panel>\n  <Resizable.Handle withHandle />\n  <Resizable.Panel><div>Main</div></Resizable.Panel>\n</Resizable.PanelGroup>',
      },
    ],
  },
  scrollarea: {
    name: "ScrollArea",
    description:
      "Custom-styled scrollable container with Runox-themed scrollbars.",
    import: `import { ScrollArea } from "@runox/ui";`,
    propsTable: [],
    subComponents: ["ScrollArea.Bar (orientation: 'vertical'|'horizontal')"],
    variants: [
      {
        title: "Vertical Scroll",
        code: '<ScrollArea className="h-64">\n  {items.map(item => <div key={item.id}>{item.name}</div>)}\n</ScrollArea>',
      },
    ],
  },
  markdownviewer: {
    name: "MarkdownViewer",
    description:
      "Renders Markdown string content with headings, lists, code blocks, and links.",
    import: `import { MarkdownViewer } from "@runox/ui";`,
    propsTable: [
      {
        name: "children",
        type: "string",
        default: "required",
        description: "Markdown string to render",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Basic",
        code: '<MarkdownViewer>{"# Hello\\n\\nThis is **bold** text."}</MarkdownViewer>',
      },
    ],
  },
  syntaxhighlighter: {
    name: "SyntaxHighlighter",
    description:
      "Code block with syntax highlighting, line numbers, and optional language header.",
    import: `import { SyntaxHighlighter } from "@runox/ui";`,
    propsTable: [
      {
        name: "code",
        type: "string",
        default: "required",
        description: "Code to highlight",
      },
      {
        name: "language",
        type: "Language",
        default: "required",
        description: "Programming language",
      },
      {
        name: "showLineNumbers",
        type: "boolean",
        default: "false",
        description: "Show line numbers",
      },
      {
        name: "withHeader",
        type: "boolean",
        default: "false",
        description: "Show language label",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "TypeScript",
        code: '<SyntaxHighlighter language="tsx" showLineNumbers code={`const x = 42;`} />',
      },
    ],
  },
  navigationmenu: {
    name: "NavigationMenu",
    description:
      "Desktop navigation menu with sub-menus, checkbox/radio items, keyboard navigation.",
    import: `import { NavigationMenu, Menubar } from "@runox/ui";`,
    propsTable: [],
    subComponents: [
      "NavigationMenu.List",
      "NavigationMenu.Item",
      "NavigationMenu.Trigger",
      "NavigationMenu.Content",
      "NavigationMenu.Link",
    ],
    variants: [
      {
        title: "Nav Menu",
        code: '<NavigationMenu>\n  <NavigationMenu.List>\n    <NavigationMenu.Item value="docs">\n      <NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>\n      <NavigationMenu.Content>\n        <NavigationMenu.Link href="/docs">Getting Started</NavigationMenu.Link>\n      </NavigationMenu.Content>\n    </NavigationMenu.Item>\n  </NavigationMenu.List>\n</NavigationMenu>',
      },
    ],
  },
  image: {
    name: "Image",
    description:
      "Image component with fallback, zoom support, and blur placeholder.",
    import: `import { Image } from "@runox/ui";`,
    propsTable: [
      {
        name: "src",
        type: "string",
        default: "undefined",
        description: "Image source",
      },
      {
        name: "fallbackSrc",
        type: "string",
        default: "undefined",
        description: "Fallback if src fails",
      },
      {
        name: "zoom",
        type: "boolean",
        default: "false",
        description: "Click-to-zoom",
      },
      {
        name: "alt",
        type: "string",
        default: "required",
        description: "Alt text",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "With Fallback",
        code: '<Image src="/photo.jpg" fallbackSrc="/placeholder.jpg" alt="Photo" zoom />',
      },
    ],
  },
  imagecropper: {
    name: "ImageCropper",
    description:
      "Interactive image crop tool with rect/round shapes and data URL output.",
    import: `import { ImageCropper } from "@runox/ui";`,
    propsTable: [
      {
        name: "image",
        type: "string",
        default: "required",
        description: "Image URL or data URL",
      },
      {
        name: "onCropComplete",
        type: "(url: string) => void",
        default: "required",
        description: "Cropped data URL callback",
      },
      {
        name: "cropShape",
        type: '"rect" | "round"',
        default: '"rect"',
        description: "Crop mask shape",
      },
      {
        name: "aspect",
        type: "number",
        default: "1",
        description: "Aspect ratio",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Avatar Crop",
        code: '<ImageCropper\n  image={imageUrl}\n  cropShape="round"\n  aspect={1}\n  onCropComplete={(url) => setAvatar(url)}\n/>',
      },
    ],
  },
  errorboundary: {
    name: "ErrorBoundary",
    description:
      "React error boundary with custom fallback renderer and reset capability.",
    import: `import { ErrorBoundary } from "@runox/ui";`,
    propsTable: [
      {
        name: "fallback",
        type: "(info: { error: Error; reset: () => void }) => ReactNode",
        default: "undefined",
        description: "Custom error UI",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "With Fallback",
        code: '<ErrorBoundary\n  fallback={({ error, reset }) => (\n    <Alert color="danger" title="Error">\n      {error.message}\n      <Button onClick={reset}>Retry</Button>\n    </Alert>\n  )}\n>\n  <MyComponent />\n</ErrorBoundary>',
      },
    ],
  },
  bentogrid: {
    name: "BentoGrid",
    description:
      "Bento-style grid layout with 4 variants and Item sub-component.",
    import: `import { BentoGrid } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"default" | "bordered" | "glass" | "subtle"',
        default: '"default"',
        description: "Visual style",
      },
    ],
    subComponents: ["BentoGrid.Item (title, description, header, icon)"],
    variants: [
      {
        title: "Glass Grid",
        code: '<BentoGrid variant="glass">\n  <BentoGrid.Item title="Feature 1" description="Description" className="col-span-2" />\n  <BentoGrid.Item title="Feature 2" />\n</BentoGrid>',
      },
    ],
  },
  masonrygrid: {
    name: "MasonryGrid",
    description:
      "Pinterest-style masonry layout with responsive column configuration.",
    import: `import { MasonryGrid } from "@runox/ui";`,
    propsTable: [
      {
        name: "columns",
        type: "number | { base?: number; md?: number; lg?: number }",
        default: "3",
        description: "Column count",
      },
      {
        name: "gap",
        type: '"sm" | "md" | "lg" | "xl"',
        default: '"md"',
        description: "Gap between items",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Photo Grid",
        code: '<MasonryGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">\n  {photos.map(p => <img key={p.id} src={p.url} />)}\n</MasonryGrid>',
      },
    ],
  },
  list: {
    name: "List",
    description:
      "Semantic list with 4 variants, 3 sizes, and collapsible items.",
    import: `import { List } from "@runox/ui";`,
    propsTable: [
      {
        name: "variant",
        type: '"bullet" | "number" | "icon" | "none"',
        default: '"bullet"',
        description: "List style",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
    ],
    subComponents: ["List.Item (icon, collapsible, title)"],
    variants: [
      {
        title: "Numbered",
        code: '<List variant="number">\n  <List.Item>First step</List.Item>\n  <List.Item>Second step</List.Item>\n</List>',
      },
    ],
  },
  glassfilters: {
    name: "GlassFilters",
    description:
      "Hidden SVG filter definitions required for liquid-glass effects. Place once in app root.",
    import: `import { GlassFilters } from "@runox/ui";`,
    propsTable: [],
    subComponents: [],
    variants: [
      {
        title: "App Root Setup",
        code: "// Place once near your app root:\n<GlassFilters />\n<RunoxProvider>{children}</RunoxProvider>",
      },
    ],
  },
  label: {
    name: "Label",
    description:
      "Accessible form label with 3 sizes, required indicator, and sub-label.",
    import: `import { Label } from "@runox/ui";`,
    propsTable: [
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "requiredIndicator",
        type: "boolean",
        default: "false",
        description: "Show * required marker",
      },
      {
        name: "subLabel",
        type: "string",
        default: "undefined",
        description: "Secondary label text",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Required",
        code: '<Label htmlFor="email" requiredIndicator>Email Address</Label>',
      },
    ],
  },
  radiogroup: {
    name: "RadioGroup",
    description: "Accessible radio group with compound Item sub-component.",
    import: `import { RadioGroup } from "@runox/ui";`,
    propsTable: [
      {
        name: "value",
        type: "string",
        default: "undefined",
        description: "Controlled value",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        default: "undefined",
        description: "Change handler",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"vertical"',
        description: "Layout direction",
      },
    ],
    subComponents: ["RadioGroup.Item (value: string)"],
    variants: [
      {
        title: "Vertical",
        code: '<RadioGroup onValueChange={setPlan}>\n  <RadioGroup.Item value="free">Free</RadioGroup.Item>\n  <RadioGroup.Item value="pro">Pro</RadioGroup.Item>\n</RadioGroup>',
      },
    ],
  },
  radio: {
    name: "Radio",
    description:
      "Single radio button with label, description, and color theming.",
    import: `import { Radio } from "@runox/ui";`,
    propsTable: [
      {
        name: "label",
        type: "string",
        default: "undefined",
        description: "Radio label",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: "Size scale",
      },
      {
        name: "color",
        type: '"primary" | "secondary" | "success"',
        default: '"primary"',
        description: "Selected color",
      },
    ],
    subComponents: [],
    variants: [
      { title: "Basic", code: '<Radio label="Option A" value="a" />' },
    ],
  },
  themeprovider: {
    name: "ThemeProvider",
    description:
      "Standalone theme provider for dark/light/system mode and token injection.",
    import: `import { ThemeProvider } from "@runox/ui";`,
    propsTable: [
      {
        name: "defaultTheme",
        type: '"light" | "dark" | "system"',
        default: '"system"',
        description: "Initial theme",
      },
      {
        name: "tokens",
        type: "RunoxTheme",
        default: "undefined",
        description: "Token overrides",
      },
      {
        name: "enableSystem",
        type: "boolean",
        default: "true",
        description: "OS theme preference",
      },
    ],
    subComponents: [],
    variants: [
      {
        title: "Dark Mode",
        code: '<ThemeProvider defaultTheme="dark" tokens={{ primaryColor: "#06b6d4" }}>\n  <App />\n</ThemeProvider>',
      },
    ],
  },
};

const outPath = path.join(root, "dist", "mcp-registry.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(registry, null, 2) + "\n", "utf8");
const count = Object.keys(registry).length;
console.log(`mcp-registry.json written with ${count} components`);
