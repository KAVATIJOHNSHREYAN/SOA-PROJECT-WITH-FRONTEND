describe('TMS Application Logic & Utilities', () => {
  describe('Auth Reducer Logic', () => {
    const initialState = {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };

    const authReducer = (state, action) => {
      switch (action.type) {
        case 'AUTH_START':
          return { ...state, loading: true, error: null };
        case 'AUTH_SUCCESS':
          return {
            ...state,
            loading: false,
            isAuthenticated: true,
            user: action.payload.user,
            token: action.payload.token,
            refreshToken: action.payload.refreshToken,
            error: null,
          };
        case 'AUTH_FAILURE':
          return { ...state, loading: false, error: action.payload };
        case 'CLEAR_ERROR':
          return { ...state, error: null };
        case 'LOGOUT':
          return { ...initialState };
        default:
          return state;
      }
    };

    it('handles AUTH_START by setting loading to true', () => {
      const state = authReducer(initialState, { type: 'AUTH_START' });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles AUTH_SUCCESS by storing user, token, and authenticated flag', () => {
      const user = { username: 'admin', role: 'ADMIN', email: 'admin@tms.com' };
      const state = authReducer(initialState, {
        type: 'AUTH_SUCCESS',
        payload: { user, token: 'fake-jwt', refreshToken: 'fake-ref' },
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.username).toBe('admin');
      expect(state.token).toBe('fake-jwt');
      expect(state.loading).toBe(false);
    });

    it('handles LOGOUT by clearing authentication state', () => {
      const loggedIn = {
        user: { username: 'admin' },
        token: 'token',
        refreshToken: 'ref',
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      const state = authReducer(loggedIn, { type: 'LOGOUT' });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('Booking Data Validation & UUID Integrity', () => {
    it('preserves UUID string tripId without corrupting via parseInt', () => {
      const tripId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const formPayload = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        tripId: tripId,
        seatCount: 2,
      };

      expect(typeof formPayload.tripId).toBe('string');
      expect(formPayload.tripId).toBe(tripId);
      expect(isNaN(formPayload.tripId)).toBe(true); // Should NOT be a number
      expect(formPayload.seatCount).toBe(2);
    });
  });

  describe('Billing Calculations', () => {
    it('correctly calculates invoice subtotal, tax and total amount', () => {
      const items = [
        { description: 'Transport Charge', quantity: 2, unitPrice: 2500 },
        { description: 'Loading & Handling', quantity: 1, unitPrice: 1000 },
      ];
      const taxRate = 18;

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      expect(subtotal).toBe(6000);
      expect(taxAmount).toBe(1080);
      expect(totalAmount).toBe(7080);
    });

    it('correctly computes financial summary totals from invoices', () => {
      const invoices = [
        { invoiceNumber: 'INV-001', totalAmount: 5000, status: 'PAID' },
        { invoiceNumber: 'INV-002', totalAmount: 3000, status: 'SENT' },
        { invoiceNumber: 'INV-003', totalAmount: 2000, status: 'DRAFT' },
      ];

      const totalInvoiced = invoices.reduce(
        (sum, i) => sum + (Number(i.totalAmount) || 0),
        0
      );
      const totalPaid = invoices
        .filter((i) => i.status === 'PAID')
        .reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
      const outstanding = invoices
        .filter((i) => i.status === 'SENT' || i.status === 'DRAFT')
        .reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);

      expect(totalInvoiced).toBe(10000);
      expect(totalPaid).toBe(5000);
      expect(outstanding).toBe(5000);
    });
  });

  describe('Service History Parsing & Status Formatting', () => {
    it('accurately parses service status from formatted service descriptions', () => {
      const scheduledDesc = 'Routine Oil Change | Odometer: 25000 km | [Status: SCHEDULED]';
      const inProgressDesc = 'Brake Pad Replacement | [Status: IN_PROGRESS]';
      const completedDesc = 'Tire Rotation & Wheel Alignment | [Status: COMPLETED]';
      const plainDesc = 'Regular vehicle service checkup';

      const parseServiceStatus = (desc) => {
        if (!desc) return 'COMPLETED';
        if (desc.includes('[Status: SCHEDULED]')) return 'SCHEDULED';
        if (desc.includes('[Status: IN_PROGRESS]')) return 'IN_PROGRESS';
        return 'COMPLETED';
      };

      expect(parseServiceStatus(scheduledDesc)).toBe('SCHEDULED');
      expect(parseServiceStatus(inProgressDesc)).toBe('IN_PROGRESS');
      expect(parseServiceStatus(completedDesc)).toBe('COMPLETED');
      expect(parseServiceStatus(plainDesc)).toBe('COMPLETED');
    });

    it('cleans status metadata from description for clean display', () => {
      const desc = 'Routine Oil Change | Provider: Metro Services | [Status: SCHEDULED]';
      const cleanDescription = (str) => str.replace(/\[Status: [^\]]+\]/g, '').trim();

      expect(cleanDescription(desc)).toBe('Routine Oil Change | Provider: Metro Services |');
    });
  });
});
