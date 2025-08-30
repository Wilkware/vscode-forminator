import * as vscode from 'vscode';
import { items } from './items';

// Optional: Custom renderers for complex elements like Tree
const customRenderers: Record<string, () => string> = {
    NewItem: () => {
        return `
            <label>Caption
                <input type="text" data-key="caption" value="Tree" />
            </label>
            <label>Items (JSON)
                <textarea data-key="items" rows="5">[{"caption":"Item 1"}, {"caption":"Item 2"}]</textarea>
            </label>
    `;
    }
};

// Generic renderer for standard items
export function renderSettingsForm(key: string): string {
    if (customRenderers[key]) {
        return customRenderers[key]();
    }

    const item = items[key];
    if (!item) return `<p>Unknown item: ${key}</p>`;
    return item.parameters.map(parameter => renderParameter(parameter)).join('');
}

function renderParameter(parameter: any): string {
    const value = parameter.default;

    switch (parameter.type) {
        case 'text':
            return `
            <label>${parameter.key}:
                <div  class="vscode-textfield" >
                    <input type="text" data-key="${parameter.key}" value="${value}"/>
                </div>
            </label>`;
        case 'checkbox':
            return `
            <label>${parameter.key}:
                <div class="vscode-check">
                    <input type="checkbox" data-key="${parameter.key}" id="checkbox-${parameter.key}" name="checkbox-${parameter.key}" ${value ? 'checked' : ''} />
                    <label for="checkbox-${parameter.key}">
                        <span class="text">Default (${value})</span>
                    </label>
                </div>
            </label>`;
        case 'dropdown':
            return `
            <label>${parameter.key}:
                <div class="vscode-select">
                    <select data-key="${parameter.key}">
                        ${parameter.options.map((o: any) => `<option value="${o.value}" ${o.value === value ? 'selected' : ''}>${o.label}</option>`).join('')}
                    </select>
                    <span class="chevron-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z" />
                        </svg>
                    </span>
                </div>
            </label>
        `;
        default:
            return `
            <p>Unsupported item type: ${parameter.type}</p>`;
    }
}

// Renderer for forms.json
export function renderFormData(data: any): any {
    const type = data.type;
    switch (type) {
        case 'HorizontalSlider':
        case 'SelectCategory':
        case 'SelectColor':
        case 'SelectEvent':
        case 'SelectFile':
        case 'SelectInstance':
        case 'SelectLink':
        case 'SelectMedia':
        case 'SelectModule':
        case 'SelectObject':
        case 'SelectScript':
            data.value = Number(data.value);
            break;
        case 'ColumnLayout':
        case 'ExpansionPanel':
        case 'RowLayout':
            if (data.items === 'none') {
                data.items = [];
            } else {
                data.items = [
                    { type: 'SelectLocation', name: 'Location', caption: 'My Location' },
                    { type: 'Label', caption: 'Title' },
                    { type: 'Button', caption: 'Test', onClick: 'TM_Update($id);' }
                ];
            }
            break;
        case 'Configurator':
            if (data.sort === 'no') {
                delete data.sort;
            } else {
                data.sort = { column: 'name', direction: 'ascending' };
            }
            if (data.columns === 'no') {
                delete data.columns;
            } else if (data.columns === 'yes') {
                data.columns = [];
            } else {
                data.columns = [
                    { caption: 'Id', name: 'id', width: '75px' },
                    { caption: 'Name', name: 'name', width: 'auto' },
                    { caption: 'Type', name: 'type', width: '100px' },
                    { caption: 'Model', name: 'model', width: '175px' },
                ];
            }
            if (data.values === 'no') {
                delete data.values;
            } else if (data.values === 'yes') {
                data.values = [];
            } else {
                data.values = [
                    { id: 1, name: 'One', type: 'TypeOne', model: 'ModelOne' },
                    { id: 2, name: 'Two', type: 'TypeTwo', model: 'ModelTwo' },
                    { id: 3, name: 'Three', type: 'TypeThree', model: 'ModelThree' },
                ];
            }
            break;
        case 'Image':
            if (data.mediaID === 'no') {
                delete data.mediaID;
            } else {
                data.mediaID = Number(0);
            }
            break;
        case 'List':
            if (data.sort === 'no') {
                delete data.sort;
            } else {
                data.sort = { column: 'name', direction: 'ascending' };
            }
            if (data.columns === 'no') {
                delete data.columns;
            } else if (data.columns === 'yes') {
                data.columns = [];
            } else {
                data.columns = [
                    { caption: 'InstanceID', name: 'InstanceID', width: '75px', add: 0, edit: { type: 'SelectInstance' } },
                    { caption: 'Name', name: 'Name', width: 'auto', add: '' },
                    { caption: 'State', name: 'State', width: '40px', add: 'New!' },
                    { caption: 'Temperature', name: 'Temperature', width: '75px', add: 20.0, edit: { type: 'NumberSpinner', digits: 2 } }
                ];
            }
            if (data.values === 'no') {
                delete data.values;
            } else if (data.values === 'yes') {
                data.values = [];
            } else {
                data.values = [
                    { InstanceID: 12435, Name: 'ABCD', State: 'OK!', Temperature: 23.31, rowColor: '#ff0000' }
                ];
            }
            break;
        case 'NumberSpinner':
            data.minimum = Number(data.minimum);
            data.maximum = Number(data.maximum);
            data.value = Number(data.value);
            break;
        case 'PopupAlert':
            switch (data.popup) {
                case 'items':
                    data.popup = {
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }]
                    }
                    break;
                case 'close':
                    data.popup = {
                        closeCaption: 'I understand',
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }],
                    }
                    break;
                case 'buttons':
                    data.popup = {
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }],
                        buttons: [{ caption: "Start", onClick: 'TM_Start();' }]
                    }
                    break;
                default:
                    data.popup = {
                        closeCaption: 'I understand',
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }],
                        buttons: [{ caption: "Start", onClick: 'TM_Start();' }]
                    }
            }
            break;
        case 'PopupButton':
            switch (data.popup) {
                case 'items':
                    data.popup = {
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }]
                    }
                    break;
                case 'caption':
                    data.popup = {
                        caption: 'My Element Popup',
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }],
                    }
                    break;
                case 'buttons':
                    data.popup = {
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }],
                        buttons: [{ caption: "Start", onClick: 'TM_Start();' }]
                    }
                    break;
                default:
                    data.popup = {
                        caption: 'My Element Popup',
                        closeCaption: 'I understand',
                        items: [{ type: 'SelectVariable', name: 'VariableActionTest', caption: 'Some Action Variable' }],
                        buttons: [{ caption: "Start", onClick: 'TM_Start();' }]
                    }
            }
            break;
        case 'Select':
            if (data.options === 'none') {
                data.options = [];
            } else {
                data.options = [
                    { caption: 'Bit (1Bit)', value: 0 },
                    { caption: 'Bits (2Bit)', value: 1 },
                    { caption: 'Bits (4Bit)', value: 2 },
                    { caption: 'Byte (8Bit)', value: 3 }
                ];
            }
            break;
        case 'SelectVariable':
            data.requiredAction = Number(data.requiredAction);
            data.requiredLogging = Number(data.requiredLogging);
            data.value = Number(data.value);
            break;
        case 'StatusMessage':
            delete data.type;
            break;
        case 'Tree':
            if (data.sort === 'no') {
                delete data.sort;
            } else {
                data.sort = { column: 'name', direction: 'ascending' };
            }
            if (data.columns === 'no') {
                delete data.columns;
            } else if (data.columns === 'yes') {
                data.columns = [];
            } else {
                data.columns = [
                    { caption: 'InstanceID', name: 'InstanceID', width: '75px', add: 0, edit: { type: 'SelectInstance' } },
                    { caption: 'Name', name: 'Name', width: 'auto', add: '' },
                    { caption: 'State', name: 'State', width: '40px', add: 'New!' },
                    { caption: 'Temperature', name: 'Temperature', width: '75px', add: 20.0, edit: { type: 'NumberSpinner', digits: 2 } }
                ];
            }
            if (data.values === 'no') {
                delete data.values;
            } else if (data.values === 'yes') {
                data.values = [];
            } else {
                data.values = [
                    { id: 1, InstanceID: 0, Name: 'Category', State: '', Temperature: 0 },
                    { id: 2, parent: 1, InstanceID: 12435, Name: 'ABCD', State: 'Ok!', Temperature: 23.31, rowColor: '#ff0000' }
                ];
            }
            break;
        default:
    }

    // Config settings
    const config = vscode.workspace.getConfiguration('symcon');
    const allowEmptyValues = config.get<boolean>('form.emptyValues', true);
    const deleteDefaultValues = config.get<boolean>('form.deleteDefaults', false);
    const overwriteDefaultWidth = config.get<string>('form.defaultWidth', '');
    const alwaysIncludesRaw = config.get<string>('form.alwaysIncludes', '');
    const alwaysIncludes = alwaysIncludesRaw.split(',').map(key => key.trim()).filter(Boolean);

    console.log('emptyValues: ', allowEmptyValues);
    console.log('deleteDefaults: ', deleteDefaultValues);
    console.log('defaultWidth: ', overwriteDefaultWidth);
    console.log('alwaysIncludes:', alwaysIncludes);

    // Create lookup table for defaults
    const item = items[type];
    const defaults: Record<string, any> = {};
    if (item?.parameters) {
        for (const param of item.parameters) {
            defaults[param.key] = param.default;
        }
    }

    // string -> number conversion (if applicable)
    const numbers = [
        'color', 'current', 'code', 'discoveryInterval', 'digits', 'objectID', 'targetID', 'variableID',
        'maximum', 'minimum', 'profileType', 'rowCount', 'stepSize'
    ];

    // Generel typ translation
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        let value = data[key];

        // 'true' / 'false' as bool
        if (value === 'true') value = true;
        else if (value === 'false') value = false;

        // overwrite default width
        if (overwriteDefaultWidth != '' && key == 'width' && key in defaults && value === defaults[key]) {
            value = overwriteDefaultWidth;
        }

        // If key is in alwaysInclude, always keep
        if (alwaysIncludes.includes(key)) {
            if (numbers.includes(key)) {
                data[key] = value;
            } else {
                data[key] = value;
            }
            continue;
        }

        // If value is empty and ‘emptyNames’ is deactivated => remove field
        if (value === '' && !allowEmptyValues) {
            delete data[key];
            continue;
        }

        // Delete default value (if activated)
        if (deleteDefaultValues && key in defaults && value === defaults[key]) {
            delete data[key];
            continue;
        }
        if (numbers.includes(key)) {
            value = Number(value);
        }
        // Write the converted value back again
        data[key] = value;
    }
    return data;
}
