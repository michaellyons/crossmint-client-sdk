import { html, LitElement } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { property } from "lit/decorators/property.js";
import { customElement } from "lit/decorators/custom-element.js";
import {
    mintingContractTypes,
    onboardingRequestStatusResponse,
    crossmintStatusService,
    crossmintModalService,
    crossmintPayButtonService,
    PayButtonConfig,
    clientNames,
} from "@crossmint/client-sdk-base";
import { LIB_VERSION } from "./version";
import { CrossmintPayButtonLitProps } from "./types";
import { buttonStyles } from "./styles";

const propertyDefaults: CrossmintPayButtonLitProps = {
    className: "",
    theme: "dark",
    disabled: false,
    tabIndex: 0,
    mintTo: "",
    emailTo: "",
    listingId: "",
    clientId: "",
    auctionId: "",
    environment: "",
    hideMintOnInactiveClient: false,
    showOverlay: true,
    mintConfig: {
        type: mintingContractTypes.CANDY_MACHINE,
    },
    onClick: undefined,
    whPassThroughArgs: undefined,
    paymentMethod: undefined,
    preferredSigninMethod: undefined,
    dismissOverlayOnClick: false,
};

@customElement("crossmint-pay-button")
export class CrossmintPayButton extends LitElement {
    @property({ type: String })
    theme = propertyDefaults.theme;

    @property({ type: Boolean })
    disabled = propertyDefaults.disabled;

    @property({ type: String })
    mintTo = propertyDefaults.mintTo;

    @property({ type: String })
    emailTo = propertyDefaults.emailTo;

    @property({ type: String })
    listingId = propertyDefaults.listingId;

    @property({ type: String })
    clientId = propertyDefaults.clientId;

    @property({ type: String })
    auctionId = propertyDefaults.auctionId;

    @property({ type: String })
    environment = propertyDefaults.environment;

    @property({ type: Boolean })
    hideMintOnInactiveClient = propertyDefaults.hideMintOnInactiveClient;

    @property({ type: Boolean })
    showOverlay = propertyDefaults.showOverlay;

    @property({ type: Object })
    mintConfig: PayButtonConfig = {
        type: mintingContractTypes.CANDY_MACHINE,
    };

    @property({ type: Function })
    onClick = propertyDefaults.onClick;

    @property({ type: Object})
    whPassThroughArgs = propertyDefaults.whPassThroughArgs;

    @property({ type: String })
    paymentMethod = propertyDefaults.paymentMethod;

    @property({ type: String })
    preferredSigninMethod = propertyDefaults.preferredSigninMethod;

    @property({ type: Boolean })
    dismissOverlayOnClick = propertyDefaults.dismissOverlayOnClick;

    static styles = buttonStyles;

    connecting = false;
    setConnecting = (conn: boolean) => {
        this.connecting = conn;
    };
    status = onboardingRequestStatusResponse.WAITING_SUBMISSION;
    setStatus = (status: onboardingRequestStatusResponse) => {
        this.status = status;
    };
    classes = { light: false };
    statusService: any = null;
    modalService: any = null;

    connectedCallback() {
        super.connectedCallback();

        const { fetchClientIntegration } = crossmintStatusService({
            libVersion: LIB_VERSION,
            clientId: this.clientId,
            environment: this.environment,
            auctionId: this.auctionId,
            mintConfig: this.mintConfig,
            setStatus: this.setStatus,
            clientName: clientNames.vanillaUi,
        });

        if (this.hideMintOnInactiveClient) {
            fetchClientIntegration();
        }
    }

    render() {
        const { shouldHideButton, handleClick, getButtonText } = crossmintPayButtonService({
            onClick: this.onClick,
            connecting: this.connecting,
            paymentMethod: this.paymentMethod,
        });
        if (
            shouldHideButton({
                hideMintOnInactiveClient: this.hideMintOnInactiveClient,
                status: this.status,
            })
        ) {
            return html``;
        }
        const content = getButtonText(this.connecting);

        const { connect } = crossmintModalService({
            environment: this.environment,
            clientId: this.clientId,
            showOverlay: this.showOverlay || true,
            dismissOverlayOnClick: this.dismissOverlayOnClick,
            setConnecting: this.setConnecting,
            libVersion: LIB_VERSION,
            clientName: clientNames.vanillaUi,
        });

        const _handleClick = (e: any) =>
            handleClick(e, () => {
                connect(
                    this.mintConfig,
                    this.mintTo,
                    this.emailTo,
                    this.listingId,
                    this.whPassThroughArgs,
                    this.paymentMethod,
                    this.preferredSigninMethod,
                );
            });

        this.classes.light = this.theme === "light";

        return html`
            <button
                class=${classMap(this.classes)}
                .disabled=${this.disabled}
                @click=${_handleClick}
                tabindex=${this.tabIndex}
                part="button"
            >
                <img src="https://www.crossmint.io/assets/crossmint/logo.png" alt="Crossmint logo" />
                <span part="contentParagraph">${content}</span>
            </button>
        `;
    }
}
