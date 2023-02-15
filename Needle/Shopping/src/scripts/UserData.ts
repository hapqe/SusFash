import { Behaviour } from '@needle-tools/engine';

export class UserData extends Behaviour {
    static instance: UserData;

    awake(): void {
        if (UserData.instance) {
            this.destroy();
            return;
        }
        UserData.instance = this;

        this.getData();
    }

    getData() {
        window.parent.postMessage({ fetchData: true }, "*");
        window.addEventListener('message', (d: any) => {
            if (d.data.isUserData)
                window.dispatchEvent(new CustomEvent('userData', { detail: d.data }));
        });
    }
}