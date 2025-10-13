import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * registerAssignSplitter
 *
 * @param context: vscode.ExtensionContext
 * 
 * @return void
 */
export function registerAssignSplitter(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('assignSplitterToModule', async () => {
            try {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    vscode.window.showErrorMessage(vscode.l10n.t('No active editor.'));
                    return;
                }

                const file = activeEditor.document.fileName;
                if (!file.endsWith('module.json')) {
                    vscode.window.showWarningMessage(vscode.l10n.t('Please open the module JSON file (module.json) before running this command.'));
                    return;
                }

                // Splitter auswählen
                const items = SPLITTERS.map(s => ({
                    label: s.name,
                    description: s.guid,
                    splitter: s
                }));

                const choice = await vscode.window.showQuickPick(items, {
                    placeHolder: vscode.l10n.t("Which splitter instance type would you like to store?")
                });
                if (!choice) return;

                const splitter = choice.splitter;

                // module.json laden
                const raw = fs.readFileSync(file, "utf-8");
                const json = JSON.parse(raw);

                // Patchen
                json.parentRequirements = splitter.implements;
                json.implemented = splitter.childs;

                // speichern
                fs.writeFileSync(file, JSON.stringify(json, null, 4), "utf-8");

                vscode.window.showInformationMessage(vscode.l10n.t("Splitter '{0}' entered in {1}.", splitter.name, path.basename(file)));
            } catch (e: any) {
                vscode.window.showErrorMessage(vscode.l10n.t('Error: {0}', e.message));
            }
        })
    );
}

interface SplitterInfo {
    name: string;
    guid: string;
    parents: string[];
    childs: string[];
    implements: string[];
}

const SPLITTERS: SplitterInfo[] = [
    {
        name: "BACnet Client Device",
        guid: "{D6E54B89-A9FB-DF3E-DBF1-CC8CF3908783}",
        parents: ["{8E4D9B23-E0F2-1E05-41D8-C21EA53B8706}"],
        childs: ["{A5DB314D-AEEB-187C-9D6A-90F7AA2BC235}"],
        implements: ["{9082C662-7864-D5CA-863F-53999200D897}", "{7047EF33-EBDA-316F-A961-8A0CD62404EF}"]
    },
    {
        name: "Cutter",
        guid: "{AC6C6E74-C797-40B3-BA82-F135D941D1A2}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}", "{4A550680-80C5-4465-971E-BBF83205A02B}"],
        childs: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}", "{FD7FF32C-331E-4F6B-8BA8-F73982EF5AA7}"]
    },
    {
        name: "DMX Gateway",
        guid: "{B1E43BF6-770A-4FD7-B4FE-6D265F93746B}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{311686E9-E1C5-4247-931B-EB8FF396638F}", "{40013ECC-1C8C-3106-489E-3B2788857EA4}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{F241DA6A-A8BD-484B-A4EA-CC2FA8D83031}"]
    },
    {
        name: "EHZ Gateway",
        guid: "{BA419F5E-900B-5DF7-BC9A-A3829885DEEC}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{D4C4020D-A8F5-2C80-4F03-B559DDADB4AE}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{EC803DD1-401D-99C2-7F64-AD76A097A0E5}"]
    },
    {
        name: "EnOcean Gateway",
        guid: "{A52FEFE9-7858-4B8E-A96E-26E15CB944F7}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{DE2DA2C0-7A28-4D23-A9AA-6D1C7609C7EC}", "{8FBAC1D9-B0B0-2E48-79BB-B5553FC54C23}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{70E3075F-A35D-4DEB-AC20-C929A156FE48}"]
    },
    {
        name: "FHZ",
        guid: "{57040540-4432-4220-8D2D-4676B57E223D}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{DF4F0170-1C5F-4250-840C-FB5B67262530}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{122F60FB-BE1B-4CAB-A427-2613E4C82CBA}"]
    },
    {
        name: "FS10 Gateway",
        guid: "{753E7267-7558-49D3-ACFB-86755C28318D}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{78AC3D2F-D2FA-416A-BA19-ED4E557839EB}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{F8ABF3AB-AF9F-4588-BCA9-273EF7EF1732}"]
    },
    {
        name: "HomeMatic HCU Gateway",
        guid: "{9ACB5D0F-8FAB-C069-1BE4-C7CD6E3880E1}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{C1E5BFB3-1856-9C55-AF50-C67957EAF8D9}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{E9EF846B-C7C5-FCEC-B410-AC5F43C946E2}"]
    },
    {
        name: "IPS-868 Gateway",
        guid: "{995946C3-7995-48A5-86E1-6FB16C3A0F8A}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{7C307DE6-093B-4E83-AF0B-116B50569EF4}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{9DD17B0B-030F-4849-8BFF-88EB4BB414BA}"]
    },
    {
        name: "IRTrans Gateway",
        guid: "{0F0F74EF-2304-4C23-840F-EC1C5B9A9A82}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{B35083D2-AD72-4984-BF59-E2D5E793B421}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{E7FC23F6-C086-422D-9D66-50337C805F6C}"]
    },
    {
        name: "KNX Gateway",
        guid: "{1C902193-B044-43B8-9433-419F09C641B8}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{8A4D3B17-F8D7-4905-877F-9E69CEC3D579}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{42DFD4E4-5831-4A27-91B9-6FF1B2960260}"]
    },
    {
        name: "LCN Gateway",
        guid: "{9BDFC391-DEFF-4B71-A76B-604DBA80F207}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{0BD35CD6-01E1-497E-A656-4A9E629123A0}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{C5755489-1880-4968-9894-F8028FE1020A}"]
    },
    {
        name: "LCN Module",
        guid: "{0E31FED6-E465-4621-95D4-AAF2683C41EC}",
        parents: ["{C5755489-1880-4968-9894-F8028FE1020A}"],
        childs: ["{00E11183-CDAF-4AFB-9B13-D41A8B6D05ED}"],
        implements: ["{0BD35CD6-01E1-497E-A656-4A9E629123A0}", "{40C6F645-4A0C-40D7-9100-38EABB73B1EB}"]
    },
    {
        name: "M-Bus Gateway",
        guid: "{301AB802-23CD-4DE2-91D1-6E3BC9BF03FC}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{672C59A3-52CF-4704-848A-552598AFEF34}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{2C30BDAD-B9D7-4309-AE35-EE5AC073A663}"]
    },
    {
        name: "M-Bus Wireless Gateway",
        guid: "{73A50992-A594-1D01-7D97-2F3A769F58CD}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{CDC1414F-BFBA-F5A0-9F6B-25E7429E580E}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{BBEC21E8-E51E-468D-CAF4-A0C9F0596105}"]
    },
    {
        name: "MQTT Client",
        guid: "{F7A0DD2E-7684-95C0-64C2-D2A9DC47577B}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{7F7632D9-FA40-4F38-8DEA-C83CD4325A32}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{043EA491-0325-4ADD-8FC2-A30C8EEB4D3F}"]
    },
    {
        name: "MQTT Server",
        guid: "{C6D2AEB3-6E1F-4B2E-8E69-3A1A00246850}",
        parents: ["{C8792760-65CF-4C53-B5C7-A30FCC84FEFE}"],
        childs: ["{7F7632D9-FA40-4F38-8DEA-C83CD4325A32}"],
        implements: ["{7A1272A4-CBDB-46EF-BFC6-DCF4A53D2FC7}", "{043EA491-0325-4ADD-8FC2-A30C8EEB4D3F}"]
    },
    {
        name: "ModBus Gateway",
        guid: "{A5F663AB-C400-4FE5-B207-4D67CC030564}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{77B31ABB-18FA-4B91-BB63-E5B2AB5588F4}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{E310B701-4AE7-458E-B618-EC13A1A6F6A8}"]
    },
    {
        name: "OPCUA Client",
        guid: "{140BF80C-54FE-C03A-3CCC-990A7ECBF855}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{0A5DB39B-70F1-1806-7E29-6C2D8614058B}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{F75283DA-DEB0-9622-E2CD-254192A35D89}"]
    },
    {
        name: "OZW Device",
        guid: "{CE54AFB0-625A-4F37-B5C1-EAF1FD2A1DA6}",
        parents: ["{DB344659-ECCF-4780-969D-872A1ADC139A}"],
        childs: ["{B8E69181-4F63-422C-8238-B2248751169F}"],
        implements: ["{75A04B59-9545-4163-9914-1239CBBCD5AE}", "{B9339593-D996-410D-96A4-56DDDDF3C3D6}"]
    },
    {
        name: "OZW Gateway",
        guid: "{1D60A51E-FF04-4D82-9E0D-04B3A11EF13F}",
        parents: ["{D4C1D08F-CD3B-494B-BE18-B36EF73B8F43}"],
        childs: ["{75A04B59-9545-4163-9914-1239CBBCD5AE}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{DB344659-ECCF-4780-969D-872A1ADC139A}"]
    },
    {
        name: "OneWire Gateway",
        guid: "{CED1D815-2477-4B05-8F65-0E4475913063}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}", "{5A26300D-96C4-4A78-A794-1DF8453AA7C2}"],
        childs: ["{7DF59F47-5AE7-4709-B269-807C3016B5EE}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{7DF59F47-5AE7-4709-B269-807C3016B5EE}"]
    },
    {
        name: "Siemens Gateway",
        guid: "{1B0A36F7-343F-42F3-8181-0748819FB324}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{EC09E155-355C-4DC2-95C7-5C336B1C9D48}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{042EF3A2-ECF4-404B-9FA2-42BA032F4A56}"]
    },
    {
        name: "WMRS200 Gateway",
        guid: "{E4FDC411-95D5-453C-B731-0CEB0483E663}",
        parents: ["{4A550680-80C5-4465-971E-BBF83205A02B}"],
        childs: ["{93727164-A8C8-40D5-8038-A32B12247FAB}"],
        implements: ["{FD7FF32C-331E-4F6B-8BA8-F73982EF5AA7}", "{ED60928C-B2BE-4F64-9EB0-49911AB66A5C}"]
    },
    {
        name: "WuT Gateway",
        guid: "{01CA6888-C833-484E-A3F3-806535421CB7}",
        parents: ["{D4C1D08F-CD3B-494B-BE18-B36EF73B8F43}"],
        childs: ["{7D516779-3959-49A6-878A-7F037799C190}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{92B71588-7F58-45F5-9028-21598C54B264}"]
    },
    {
        name: "XBee Gateway",
        guid: "{7FA47C08-E31B-44A6-9E50-20C4DDD3E081}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{3431D06E-3992-4656-9F2E-129B839735A5}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{91DF0325-934F-4E76-A3D2-BF7BD4DA635C}"]
    },
    {
        name: "XBee Splitter",
        guid: "{9D5DCE79-1A97-4531-9D10-68839F4BEAAC}",
        parents: ["{91DF0325-934F-4E76-A3D2-BF7BD4DA635C}"],
        childs: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}"],
        implements: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}", "{3431D06E-3992-4656-9F2E-129B839735A5}"]
    },
    {
        name: "Z-Wave Gateway",
        guid: "{4EF72D56-BF9F-4347-8F0A-2035D241116F}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}"],
        childs: ["{F403B0C2-AA74-4070-98C3-BC0815D941CD}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{0F6E6A9E-8121-473D-9E1C-161A09829771}"]
    },
    {
        name: "dS Splitter",
        guid: "{8D7872F4-CAC3-409D-926B-CCF1BA9E937B}",
        parents: ["{D4C1D08F-CD3B-494B-BE18-B36EF73B8F43}"],
        childs: ["{1602EDEB-367D-4B87-82DD-1222BCB95448}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{EB906053-D9FD-4E1B-A2CD-7E5C1B3C7706}"]
    },
    {
        name: "xComfort Gateway",
        guid: "{D2DCE381-19A7-4D14-B819-49C0539BC350}",
        parents: ["{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}", "{4A550680-80C5-4465-971E-BBF83205A02B}"],
        childs: ["{BF8A4773-5DA8-47F6-9E7F-809886A15859}"],
        implements: ["{018EF6B5-AB94-40C6-AA53-46943E824ACF}", "{FD7FF32C-331E-4F6B-8BA8-F73982EF5AA7}", "{06ECB637-A51A-45CE-BAC8-9D5F922166CE}"]
    }
];