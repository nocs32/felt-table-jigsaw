import { configure } from 'mobx';

// Every state change must go through an action (store method).
configure({ enforceActions: 'always' });
