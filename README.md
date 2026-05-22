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

| Element Type                              | Prefix     | Example                           |
|-------------------------------------------|------------|-----------------------------------|
| **Tasks**                                 |            |                                   |
| Task (generic)                            | `t_`       | `t_do_something`                  |
| User Task                                 | `ut_`      | `ut_approve_request`              |
| Service Task                              | `srvt_`    | `srvt_send_notification`          |
| Script Task                               | `scrt_`    | `scrt_calculate_total`            |
| Business Rule Task                        | `brt_`     | `brt_evaluate_policy`             |
| Manual Task                               | `mt_`      | `mt_review_document`              |
| Send Task                                 | `sndt_`    | `sndt_send_email`                 |
| Receive Task                              | `rcvt_`    | `rcvt_receive_confirmation`       |
| **Gateways**                              |            |                                   |
| Exclusive Gateway                         | `gw_`      | `gw_is_approved`                  |
| Inclusive Gateway                         | `igw_`     | `igw_optional_review`             |
| Parallel Gateway                          | `pgw_`     | `pgw_split_flow`                  |
| Complex Gateway                           | `cgw_`     | `cgw_complex_decision`            |
| Event-Based Gateway                       | `ebgw_`    | `ebgw_wait_for_event`             |
| **Start Events**                          |            |                                   |
| Start Event (none)                        | `se_`      | `se_process_started`              |
| Start Event (Timer)                       | `tse_`     | `tse_daily_trigger`               |
| Start Event (Message)                     | `mse_`     | `mse_order_received`              |
| Start Event (Signal)                      | `sse_`     | `sse_alert_received`              |
| Start Event (Error)                       | `erre_`    | `erre_system_failure`             |
| **End Events**                            |            |                                   |
| End Event (none)                          | `ee_`      | `ee_process_completed`            |
| End Event (Message)                       | `mee_`     | `mee_confirmation_sent`           |
| End Event (Signal)                        | `see_`     | `see_alert_raised`                |
| End Event (Error)                         | `ere_`     | `ere_process_failed`              |
| **Intermediate Catch Events**             |            |                                   |
| Intermediate Catch Event (Timer)          | `tce_`     | `tce_wait_one_day`                |
| Intermediate Catch Event (Message)        | `mce_`     | `mce_response_received`           |
| Intermediate Catch Event (Signal)         | `sce_`     | `sce_signal_caught`               |
| Intermediate Catch Event (Link)           | `lce_`     | `lce_jump_target`                 |
| Intermediate Catch Event (Conditional)    | `cce_`     | `cce_condition_met`               |
| **Intermediate Throw Events**             |            |                                   |
| Intermediate Throw Event (none)           | `te_`      | `te_checkpoint`                   |
| Intermediate Throw Event (Message)        | `mte_`     | `mte_notify_partner`              |
| Intermediate Throw Event (Signal)         | `ste_`     | `ste_broadcast_signal`            |
| Intermediate Throw Event (Link)           | `lte_`     | `lte_jump_source`                 |
| Intermediate Throw Event (Compensation)   | `cte_`     | `cte_undo_payment`                |
| Intermediate Throw Event (Escalation)     | `ete_`     | `ete_escalate_to_manager`         |
| **Boundary Events**                       |            |                                   |
| Boundary Event (Timer)                    | `tbe_`     | `tbe_timeout`                     |
| Boundary Event (Message)                  | `mbe_`     | `mbe_cancellation_received`       |
| Boundary Event (Error)                    | `ebe_`     | `ebe_error_caught`                |
| Boundary Event (Escalation)               | `esbe_`    | `esbe_escalation_caught`          |
| Boundary Event (Cancel)                   | `cbe_`     | `cbe_transaction_cancelled`       |
| Boundary Event (Compensation)             | `cmpbe_`   | `cmpbe_undo_step`                 |
| Boundary Event (Conditional)              | `cndbe_`   | `cndbe_condition_triggered`       |
| Boundary Event (Signal)                   | `sbe_`     | `sbe_signal_caught`               |
| **Sub-processes & Activities**            |            |                                   |
| Sub-Process                               | `subp_`    | `subp_handle_exception`           |
| Event Sub-Process                         | `esubp_`   | `esubp_handle_error`              |
| Ad-Hoc Sub-Process                        | `ahsubp_`    | `ahsp_free_form_work`             |
| Call Activity                             | `cat_`     | `cat_invoke_subprocess`           |
| **Flows & Connections**                   |            |                                   |
| Sequence Flow                             | `sf_`      | `sf_to_approval`                  |
| Message Flow                              | `mf_`      | `mf_order_confirmation`           |
| Association                               | `assoc_`   | `assoc_note_link`                 |
| **Data**                                  |            |                                   |
| Data Object Reference                     | `do_`      | `do_invoice`                      |
| Data Store Reference                      | `ds_`      | `ds_customer_db`                  |
| **Containers**                            |            |                                   |
| Participant (Pool)                        | `pool_`    | `pool_customer`                   |
| Lane                                      | `ln_`      | `ln_back_office`                  |
| Group                                     | `grp_`     | `grp_payment_steps`               |
| **Annotations**                           |            |                                   |
| Text Annotation                           | `ta_`      | `ta_sla_note`                     |

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
