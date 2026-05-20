# camunda-modeler-plugin-snake-case-ids

A [Camunda Modeler](https://github.com/camunda/camunda-modeler) plugin that automatically generates `snake_case` IDs for BPMN elements based on their names.

## Features

- Generates technical IDs from element names by converting them to `snake_case`
- Applies type-specific prefixes to each element (e.g. `ut_` for User Tasks, `gw_` for Exclusive Gateways)
- Processes names as PascalCase for BPMN Processes
- Strips diacritics and special characters from names before converting
- Detects and resolves duplicate IDs by appending a numeric suffix
- Previews proposed ID changes before applying them
- Accessible via a sidebar panel or the menu shortcut

## ID Generation Rules

### BPMN Process

Process IDs are converted to **PascalCase** (e.g. `My Process` → `MyProcess`).

### All Other Elements

Element IDs are converted to **snake_case** with a type prefix:

| Element Type           | Prefix  | Example                          |
|------------------------|---------|----------------------------------|
| User Task              | `ut_`   | `ut_approve_request`             |
| Service Task           | `st_`   | `st_send_notification`           |
| Script Task            | `sct_`  | `sct_calculate_total`            |
| Business Rule Task     | `brt_`  | `brt_evaluate_policy`            |
| Manual Task            | `mt_`   | `mt_review_document`             |
| Send Task              | `snt_`  | `snt_send_email`                 |
| Receive Task           | `rt_`   | `rt_receive_confirmation`        |
| Exclusive Gateway      | `gw_`   | `gw_is_approved`                 |
| Parallel Gateway       | `pgw_`  | `pgw_split_flow`                 |
| Complex Gateway        | `cgw_`  | `cgw_complex_decision`           |
| Event-Based Gateway    | `ebgw_` | `ebgw_wait_for_event`            |
| Start Event            | `se_`   | `se_process_started`             |
| End Event              | `ee_`   | `ee_process_completed`           |
| Intermediate Catch Event | `ice_` | `ice_timer_elapsed`             |
| Intermediate Throw Event | `ite_` | `ite_escalation_thrown`         |
| Sub-Process            | `sp_`   | `sp_handle_exception`            |
| Call Activity          | `ca_`   | `ca_invoke_subprocess`           |
| Sequence Flow          | `sf_`   | `sf_to_approval`                 |

IDs that would start with a digit are prefixed with `n_` (or `N` for processes) to remain valid identifiers.

## Usage

### Via the menu

Open the **Plugins** menu and select **Generate snake_case IDs**, or use the keyboard shortcut:

- **Windows / Linux:** `Ctrl+Shift+G`
- **macOS:** `Cmd+Shift+G`

### Via the sidebar panel

Click the **snake_case IDs** toggle on the canvas to open the panel. From there:

1. Click **Generate IDs** to preview the proposed ID changes (highlighted in yellow).
2. Review the list — unchanged IDs are shown as-is, new IDs are highlighted.
3. Click **Rename IDs** to apply all changes to the diagram.

## Installation

1. Download or clone this repository.
2. Copy the plugin folder into the Camunda Modeler plugins directory:
   - **Windows:** `%APPDATA%\camunda-modeler\plugins\`
   - **macOS:** `~/Library/Application Support/camunda-modeler/plugins/`
   - **Linux:** `~/.config/camunda-modeler/plugins/`
3. Restart the Camunda Modeler.

## Development

Install dependencies and build the client bundle:

```bash
npm install
npm run client
```

To watch for changes during development:

```bash
npm run dev
```

## License

[MIT](LICENSE.md) © 2025 Kommitters Open Source
