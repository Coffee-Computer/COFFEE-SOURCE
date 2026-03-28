/**
 * coffee.crm — Deals, contacts, companies, activities + search on coffee.base (que + wire + drive).
 * Reusable data layer; UI stays in your page or a separate shell.
 *
 * Load after: coffee-control → coffee-ui → coffee-drive → coffee-wire → coffee-que → coffee-base.js
 *
 * @example
 *   const base = coffee.base('crm');
 *   await base.init();
 *   coffee.crm.bootstrapCrm(base); // companies → contacts → deals → activities
 *   const deals = coffee.crm.dealStore(base);
 *   const contacts = coffee.crm.contactStore(base);
 *   const companies = coffee.crm.companyStore(base);
 *   const activities = coffee.crm.activityStore(base);
 *   contacts.add({ name: 'Ada', companyId: 201, email: 'a@ac.me' });
 *   coffee.crm.searchCrm(base, 'google');
 */
(function () {
  if (typeof window === 'undefined') return;
  var coffee = window.coffee || {};

  var COLLECTION = 'deals';
  var CONTACTS_COLLECTION = 'contacts';
  var COMPANIES_COLLECTION = 'companies';
  var ACTIVITIES_COLLECTION = 'activities';
  var LEGACY_KEY = 'coffee_crm_deals';

  var ACTIVITY_TYPES = ['note', 'call', 'email', 'meeting', 'task'];

  var STAGES = {
    LEAD: 'lead',
    PROGRESS: 'progress',
    CLOSING: 'closing'
  };

  var STAGE_LIST = [STAGES.LEAD, STAGES.PROGRESS, STAGES.CLOSING];

  var COMPANY_SEED = [
    { id: 201, name: 'Google LLC', domain: 'google.com', industry: 'Cloud', notes: '', updatedAt: '2h ago' },
    { id: 202, name: 'Tesla Inc', domain: 'tesla.com', industry: 'Automotive', notes: '', updatedAt: '1d ago' },
    { id: 203, name: 'Blue Bottle Coffee', domain: 'bluebottlecoffee.com', industry: 'Retail', notes: '', updatedAt: '5m ago' }
  ];

  /** contactId / companyId match CONTACT_SEED / COMPANY_SEED. */
  var DEMO_SEED = [
    { id: 1, name: 'Google Cloud Exp.', value: '$12,000', stage: STAGES.LEAD, company: 'Google LLC', companyId: 201, lastActive: '2h ago', contactId: 101 },
    { id: 2, name: 'Tesla Fleet Order', value: '$45,000', stage: STAGES.PROGRESS, company: 'Tesla Inc', companyId: 202, lastActive: '1d ago', contactId: 102 },
    { id: 3, name: 'Blue Bottle Refresh', value: '$2,500', stage: STAGES.CLOSING, company: 'Blue Bottle Coffee', companyId: 203, lastActive: '5m ago', contactId: 103 }
  ];

  var CONTACT_SEED = [
    { id: 101, name: 'Jordan Lee', companyId: 201, company: 'Google LLC', email: 'jordan@example.com', phone: '', notes: '', status: 'active', updatedAt: '2h ago' },
    { id: 102, name: 'Sam Rivera', companyId: 202, company: 'Tesla Inc', email: 'sam@example.com', phone: '+1 415-555-0100', notes: '', status: 'active', updatedAt: '1d ago' },
    { id: 103, name: 'Riley Chen', companyId: 203, company: 'Blue Bottle Coffee', email: 'riley@example.com', phone: '', notes: 'Prefers oat milk', status: 'active', updatedAt: '5m ago' }
  ];

  var ACTIVITY_SEED = [
    { id: 301, type: 'call', body: 'Intro call — interested in enterprise tier.', at: Date.now() - 86400000, atLabel: '1d ago', contactId: 101, dealId: 1, companyId: 201 },
    { id: 302, type: 'note', body: 'Sent follow-up deck.', at: Date.now() - 3600000, atLabel: '1h ago', contactId: 102, dealId: 2, companyId: 202 }
  ];

  function ensureDealsCollection(base) {
    if (!base) return;
    var cols = base.collections();
    if (cols.indexOf(COLLECTION) === -1) {
      base.newCollection(COLLECTION);
    } else {
      base.collection(COLLECTION);
    }
  }

  function migrateLegacyLocalStorage(base) {
    if (!base) return;
    var leg = localStorage.getItem(LEGACY_KEY);
    if (!leg) return;
    try {
      var arr = JSON.parse(leg);
      if (!Array.isArray(arr) || arr.length === 0) return;
      base.collection(COLLECTION);
      if (base.listAll().length === 0) {
        arr.forEach(function (d) {
          base.add(d);
        });
      }
      localStorage.removeItem(LEGACY_KEY);
    } catch (e) {
      console.warn('coffee.crm: legacy migrate failed', e);
    }
  }

  function seedDemoIfEmpty(base) {
    if (!base) return;
    base.collection(COLLECTION);
    if (base.listAll().length > 0) return;
    DEMO_SEED.forEach(function (d) {
      base.add(d);
    });
  }

  /**
   * One-shot after await base.init(): collection + migrate + demo seed.
   * @param {object} base — return value of coffee.base(...)
   */
  function bootstrapData(base) {
    ensureDealsCollection(base);
    migrateLegacyLocalStorage(base);
    seedDemoIfEmpty(base);
  }

  function listDeals(base) {
    if (!base) return [];
    base.collection(COLLECTION);
    return base.listAll();
  }

  function normalizeStage(stage) {
    var s = String(stage || '').toLowerCase();
    if (s === STAGES.PROGRESS || s === STAGES.CLOSING || s === STAGES.LEAD) return s;
    return STAGES.LEAD;
  }

  /* ---------- Companies (before deals/contacts that reference them) ---------- */

  function ensureCompaniesCollection(base) {
    if (!base) return;
    var cols = base.collections();
    if (cols.indexOf(COMPANIES_COLLECTION) === -1) {
      base.newCollection(COMPANIES_COLLECTION);
    } else {
      base.collection(COMPANIES_COLLECTION);
    }
  }

  function seedCompaniesIfEmpty(base) {
    if (!base) return;
    base.collection(COMPANIES_COLLECTION);
    if (base.listAll().length > 0) return;
    COMPANY_SEED.forEach(function (c) {
      base.add(c);
    });
  }

  function bootstrapCompaniesData(base) {
    ensureCompaniesCollection(base);
    seedCompaniesIfEmpty(base);
  }

  function listCompanies(base) {
    if (!base) return [];
    base.collection(COMPANIES_COLLECTION);
    return base.listAll();
  }

  function getCompanyById(base, id) {
    if (!base) return null;
    var idNum = Number(id);
    base.collection(COMPANIES_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    return doc || null;
  }

  /** Display name from `companyId` or fallback `entity.company` string. */
  function companyLabel(base, entity) {
    if (!entity) return '';
    if (entity.companyId != null) {
      var co = getCompanyById(base, entity.companyId);
      if (co && co.name) return String(co.name);
    }
    return entity.company != null ? String(entity.company) : '';
  }

  function addCompany(base, input) {
    if (!base || !input || !String(input.name || '').trim()) return null;
    ensureCompaniesCollection(base);
    base.collection(COMPANIES_COLLECTION);
    var doc = {
      id: Date.now(),
      name: String(input.name).trim(),
      domain: input.domain != null ? String(input.domain).trim() : '',
      industry: input.industry != null ? String(input.industry).trim() : '',
      notes: input.notes != null ? String(input.notes).trim() : '',
      updatedAt: 'Just now'
    };
    base.add(doc);
    return doc;
  }

  function updateCompany(base, id, patch) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(COMPANIES_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    var next;
    try {
      next = JSON.parse(JSON.stringify(doc));
    } catch (e) {
      next = {};
      for (var k in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, k)) next[k] = doc[k];
      }
    }
    var p = patch || {};
    if (p.name !== undefined) next.name = String(p.name).trim();
    if (p.domain !== undefined) next.domain = String(p.domain).trim();
    if (p.industry !== undefined) next.industry = String(p.industry).trim();
    if (p.notes !== undefined) next.notes = String(p.notes).trim();
    next.updatedAt = 'Just now';
    if (!String(next.name || '').trim()) {
      base.add(doc);
      return false;
    }
    base.add(next);
    return true;
  }

  function removeCompanyById(base, id) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(COMPANIES_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    return true;
  }

  function companyStore(base) {
    return {
      collection: COMPANIES_COLLECTION,
      bootstrap: function () {
        bootstrapCompaniesData(base);
      },
      list: function () {
        return listCompanies(base);
      },
      get: function (id) {
        return getCompanyById(base, id);
      },
      add: function (input) {
        return addCompany(base, input);
      },
      update: function (id, patch) {
        return updateCompany(base, id, patch);
      },
      removeById: function (id) {
        return removeCompanyById(base, id);
      }
    };
  }

  /**
   * @param {object} base
   * @param {{ name: string, value?: string, contactId?: number|string|null, companyId?: number|string|null }} input
   * @returns {object|null} added doc shape
   */
  function addDeal(base, input) {
    if (!base || !input || !String(input.name || '').trim()) return null;
    var name = String(input.name).trim();
    var val = input.value != null ? String(input.value).trim() : '';
    var contactId = null;
    if (input.contactId != null && input.contactId !== '') {
      var cid = Number(input.contactId);
      if (!isNaN(cid) && cid > 0) contactId = cid;
    }
    var companyId = null;
    if (input.companyId != null && input.companyId !== '') {
      var gid = Number(input.companyId);
      if (!isNaN(gid) && gid > 0) companyId = gid;
    }
    var company = name.split(' ')[0];
    if (contactId != null) {
      var ct = getContactById(base, contactId);
      if (ct) {
        if (companyId == null && ct.companyId != null) {
          companyId = Number(ct.companyId);
        }
        company = companyLabel(base, ct);
      }
    }
    if (companyId != null) {
      var co = getCompanyById(base, companyId);
      if (co && co.name) company = String(co.name);
    }
    base.collection(COLLECTION);
    var doc = {
      id: Date.now(),
      name: name,
      value: val || '$0',
      stage: STAGES.LEAD,
      company: company,
      lastActive: 'Just now'
    };
    if (contactId != null) doc.contactId = contactId;
    if (companyId != null && !isNaN(companyId)) doc.companyId = companyId;
    base.add(doc);
    return doc;
  }

  function getDealById(base, id) {
    if (!base) return null;
    var idNum = Number(id);
    base.collection(COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    return doc || null;
  }

  /**
   * Deals linked to a contact (`deal.contactId`).
   */
  function listDealsForContact(base, contactId) {
    var idNum = Number(contactId);
    return listDeals(base).filter(function (d) {
      return d.contactId != null && Number(d.contactId) === idNum;
    });
  }

  function listDealsForCompany(base, companyId) {
    var idNum = Number(companyId);
    return listDeals(base).filter(function (d) {
      return d.companyId != null && Number(d.companyId) === idNum;
    });
  }

  /**
   * Patch deal fields. Use `contactId: null` to unlink.
   * @param {object} base
   * @param {object} patch — name?, value?, company?, contactId?
   */
  function updateDeal(base, id, patch) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    var next;
    try {
      next = JSON.parse(JSON.stringify(doc));
    } catch (e) {
      next = {};
      for (var k in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, k)) next[k] = doc[k];
      }
    }
    var p = patch || {};
    if (p.name !== undefined) next.name = String(p.name).trim();
    if (p.value !== undefined) next.value = String(p.value).trim();
    if (p.company !== undefined) next.company = String(p.company).trim();
    if (p.contactId !== undefined) {
      if (p.contactId === null || p.contactId === '' || p.contactId === 'none') {
        delete next.contactId;
      } else {
        var nc = Number(p.contactId);
        if (!isNaN(nc) && nc > 0) next.contactId = nc;
        else delete next.contactId;
      }
    }
    if (p.companyId !== undefined) {
      if (p.companyId === null || p.companyId === '' || p.companyId === 'none') {
        delete next.companyId;
      } else {
        var ng = Number(p.companyId);
        if (!isNaN(ng) && ng > 0) next.companyId = ng;
        else delete next.companyId;
      }
    }
    if (next.contactId != null) {
      var ctSync = getContactById(base, next.contactId);
      next.company = companyLabel(base, ctSync || {});
      if (p.companyId === undefined && ctSync && ctSync.companyId != null) {
        next.companyId = Number(ctSync.companyId);
      }
    }
    if (next.companyId != null) {
      var coSync = getCompanyById(base, next.companyId);
      if (coSync && coSync.name) next.company = String(coSync.name);
    }
    base.collection(COLLECTION);
    if (!String(next.name || '').trim()) {
      base.add(doc);
      return false;
    }
    next.lastActive = 'Just now';
    base.add(next);
    return true;
  }

  function removeDealById(base, id) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    return true;
  }

  /**
   * Move a deal to another pipeline stage (remove + re-add so IndexedDB persists).
   * @param {object} base
   * @param {number|string} id — deal.id
   * @param {string} newStage — lead | progress | closing
   * @returns {boolean}
   */
  function updateDealStage(base, id, newStage) {
    if (!base) return false;
    var stage = normalizeStage(newStage);
    var idNum = Number(id);
    base.collection(COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    if (normalizeStage(doc.stage) === stage) return true;
    base.removeDoc(doc);
    var next;
    try {
      next = JSON.parse(JSON.stringify(doc));
    } catch (e) {
      next = {};
      for (var k in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, k)) next[k] = doc[k];
      }
    }
    next.stage = stage;
    next.lastActive = 'Just now';
    base.add(next);
    return true;
  }

  function countsByStage(base) {
    var deals = listDeals(base);
    var out = {};
    out[STAGES.LEAD] = 0;
    out[STAGES.PROGRESS] = 0;
    out[STAGES.CLOSING] = 0;
    deals.forEach(function (d) {
      var st = normalizeStage(d.stage);
      if (out[st] !== undefined) out[st]++;
    });
    return out;
  }

  /* ---------- Contacts (separate collection) ---------- */

  function ensureContactsCollection(base) {
    if (!base) return;
    var cols = base.collections();
    if (cols.indexOf(CONTACTS_COLLECTION) === -1) {
      base.newCollection(CONTACTS_COLLECTION);
    } else {
      base.collection(CONTACTS_COLLECTION);
    }
  }

  function seedContactsIfEmpty(base) {
    if (!base) return;
    base.collection(CONTACTS_COLLECTION);
    if (base.listAll().length > 0) return;
    CONTACT_SEED.forEach(function (c) {
      base.add(c);
    });
  }

  function bootstrapContactsData(base) {
    ensureContactsCollection(base);
    seedContactsIfEmpty(base);
  }

  function listContacts(base) {
    if (!base) return [];
    base.collection(CONTACTS_COLLECTION);
    return base.listAll();
  }

  function getContactById(base, id) {
    if (!base) return null;
    var idNum = Number(id);
    base.collection(CONTACTS_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    return doc || null;
  }

  /**
   * @param {object} base
   * @param {{ name: string, company?: string, email?: string, phone?: string, notes?: string, status?: string }} input
   * @returns {object|null}
   */
  function addContact(base, input) {
    if (!base || !input || !String(input.name || '').trim()) return null;
    ensureContactsCollection(base);
    base.collection(CONTACTS_COLLECTION);
    var companyId = null;
    if (input.companyId != null && input.companyId !== '') {
      var gid = Number(input.companyId);
      if (!isNaN(gid) && gid > 0) companyId = gid;
    }
    var companyStr = input.company != null ? String(input.company).trim() : '';
    if (companyId != null) {
      var co = getCompanyById(base, companyId);
      if (co && co.name) companyStr = String(co.name);
    }
    var doc = {
      id: Date.now(),
      name: String(input.name).trim(),
      company: companyStr,
      email: input.email != null ? String(input.email).trim() : '',
      phone: input.phone != null ? String(input.phone).trim() : '',
      notes: input.notes != null ? String(input.notes).trim() : '',
      status: input.status != null ? String(input.status).trim() : 'active',
      updatedAt: 'Just now'
    };
    if (companyId != null) doc.companyId = companyId;
    base.add(doc);
    return doc;
  }

  /**
   * Patch fields (omit id). Persists via remove + re-add.
   * @param {object} base
   * @param {number|string} id
   * @param {object} patch
   * @returns {boolean}
   */
  function updateContact(base, id, patch) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(CONTACTS_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    var next;
    try {
      next = JSON.parse(JSON.stringify(doc));
    } catch (e) {
      next = {};
      for (var k in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, k)) next[k] = doc[k];
      }
    }
    var p = patch || {};
    if (p.name !== undefined) next.name = String(p.name).trim();
    if (p.company !== undefined) next.company = String(p.company).trim();
    if (p.companyId !== undefined) {
      if (p.companyId === null || p.companyId === '' || p.companyId === 'none') {
        delete next.companyId;
      } else {
        var ngc = Number(p.companyId);
        if (!isNaN(ngc) && ngc > 0) next.companyId = ngc;
        else delete next.companyId;
      }
    }
    if (p.email !== undefined) next.email = String(p.email).trim();
    if (p.phone !== undefined) next.phone = String(p.phone).trim();
    if (p.notes !== undefined) next.notes = String(p.notes).trim();
    if (p.status !== undefined) next.status = String(p.status).trim();
    if (next.companyId != null) {
      var cco = getCompanyById(base, next.companyId);
      if (cco && cco.name) next.company = String(cco.name);
    }
    next.updatedAt = 'Just now';
    if (!String(next.name || '').trim()) {
      base.add(doc);
      return false;
    }
    base.add(next);
    return true;
  }

  function removeContactById(base, id) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(CONTACTS_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    return true;
  }

  /**
   * Bound API for contacts (call after base.init()).
   * @param {object} base
   */
  function contactStore(base) {
    return {
      collection: CONTACTS_COLLECTION,
      bootstrap: function () {
        bootstrapContactsData(base);
      },
      list: function () {
        return listContacts(base);
      },
      get: function (id) {
        return getContactById(base, id);
      },
      add: function (input) {
        return addContact(base, input);
      },
      update: function (id, patch) {
        return updateContact(base, id, patch);
      },
      removeById: function (id) {
        return removeContactById(base, id);
      }
    };
  }

  /* ---------- Activities ---------- */

  function ensureActivitiesCollection(base) {
    if (!base) return;
    var cols = base.collections();
    if (cols.indexOf(ACTIVITIES_COLLECTION) === -1) {
      base.newCollection(ACTIVITIES_COLLECTION);
    } else {
      base.collection(ACTIVITIES_COLLECTION);
    }
  }

  function seedActivitiesIfEmpty(base) {
    if (!base) return;
    base.collection(ACTIVITIES_COLLECTION);
    if (base.listAll().length > 0) return;
    ACTIVITY_SEED.forEach(function (a) {
      base.add(a);
    });
  }

  function bootstrapActivitiesData(base) {
    ensureActivitiesCollection(base);
    seedActivitiesIfEmpty(base);
  }

  function listActivities(base) {
    if (!base) return [];
    base.collection(ACTIVITIES_COLLECTION);
    var arr = base.listAll().slice();
    arr.sort(function (a, b) {
      var ta = Number(a.at) || 0;
      var tb = Number(b.at) || 0;
      return tb - ta;
    });
    return arr;
  }

  function getActivityById(base, id) {
    if (!base) return null;
    var idNum = Number(id);
    base.collection(ACTIVITIES_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    return doc || null;
  }

  /**
   * @param {object} base
   * @param {{ type: string, body: string, at?: number, contactId?: number|string|null, dealId?: number|string|null, companyId?: number|string|null }} input
   */
  function addActivity(base, input) {
    if (!base || !input) return null;
    var body = String(input.body || '').trim();
    if (!body) return null;
    var typ = String(input.type || 'note').toLowerCase();
    if (ACTIVITY_TYPES.indexOf(typ) === -1) typ = 'note';
    ensureActivitiesCollection(base);
    base.collection(ACTIVITIES_COLLECTION);
    var at = input.at != null ? Number(input.at) : Date.now();
    if (isNaN(at)) at = Date.now();
    var doc = {
      id: Date.now(),
      type: typ,
      body: body,
      at: at,
      atLabel: input.atLabel != null ? String(input.atLabel) : 'Just now'
    };
    if (input.contactId != null && input.contactId !== '') {
      var cid = Number(input.contactId);
      if (!isNaN(cid) && cid > 0) doc.contactId = cid;
    }
    if (input.dealId != null && input.dealId !== '') {
      var did = Number(input.dealId);
      if (!isNaN(did) && did > 0) doc.dealId = did;
    }
    if (input.companyId != null && input.companyId !== '') {
      var gid = Number(input.companyId);
      if (!isNaN(gid) && gid > 0) doc.companyId = gid;
    }
    base.add(doc);
    return doc;
  }

  function removeActivityById(base, id) {
    if (!base) return false;
    var idNum = Number(id);
    base.collection(ACTIVITIES_COLLECTION);
    var doc = base.listAll().find(function (d) {
      return d.id === idNum;
    });
    if (!doc) return false;
    base.removeDoc(doc);
    return true;
  }

  function listActivitiesForContact(base, contactId) {
    var idNum = Number(contactId);
    return listActivities(base).filter(function (a) {
      return a.contactId != null && Number(a.contactId) === idNum;
    });
  }

  function listActivitiesForDeal(base, dealId) {
    var idNum = Number(dealId);
    return listActivities(base).filter(function (a) {
      return a.dealId != null && Number(a.dealId) === idNum;
    });
  }

  function listActivitiesForCompany(base, companyId) {
    var idNum = Number(companyId);
    return listActivities(base).filter(function (a) {
      return a.companyId != null && Number(a.companyId) === idNum;
    });
  }

  function activityStore(base) {
    return {
      collection: ACTIVITIES_COLLECTION,
      bootstrap: function () {
        bootstrapActivitiesData(base);
      },
      list: function () {
        return listActivities(base);
      },
      get: function (id) {
        return getActivityById(base, id);
      },
      add: function (input) {
        return addActivity(base, input);
      },
      removeById: function (id) {
        return removeActivityById(base, id);
      },
      forContact: function (contactId) {
        return listActivitiesForContact(base, contactId);
      },
      forDeal: function (dealId) {
        return listActivitiesForDeal(base, dealId);
      },
      forCompany: function (companyId) {
        return listActivitiesForCompany(base, companyId);
      }
    };
  }

  /* ---------- Search ---------- */

  function normSearchTerm(term) {
    return String(term || '').trim().toLowerCase();
  }

  function matchesSearch(obj, keys, term) {
    var t = normSearchTerm(term);
    if (!t) return true;
    for (var i = 0; i < keys.length; i++) {
      var v = obj[keys[i]];
      if (v != null && String(v).toLowerCase().indexOf(t) !== -1) return true;
    }
    return false;
  }

  function searchDeals(base, term) {
    return listDeals(base).filter(function (d) {
      return matchesSearch(d, ['name', 'company', 'value', 'lastActive', 'stage'], term);
    });
  }

  function searchContacts(base, term) {
    return listContacts(base).filter(function (c) {
      return matchesSearch(c, ['name', 'company', 'email', 'phone', 'notes', 'status'], term);
    });
  }

  function searchCompanies(base, term) {
    return listCompanies(base).filter(function (c) {
      return matchesSearch(c, ['name', 'domain', 'industry', 'notes'], term);
    });
  }

  function searchActivities(base, term) {
    return listActivities(base).filter(function (a) {
      return matchesSearch(a, ['type', 'body', 'atLabel'], term);
    });
  }

  /**
   * @returns {{ deals: object[], contacts: object[], companies: object[], activities: object[] }}
   */
  function searchCrm(base, term) {
    return {
      deals: searchDeals(base, term),
      contacts: searchContacts(base, term),
      companies: searchCompanies(base, term),
      activities: searchActivities(base, term)
    };
  }

  /** Companies → contacts → deals → activities (seeds reference ids). */
  function bootstrapCrm(base) {
    bootstrapCompaniesData(base);
    bootstrapContactsData(base);
    bootstrapData(base);
    bootstrapActivitiesData(base);
  }

  /**
   * Escape for inserting user/deal strings into innerHTML.
   */
  function escapeHtml(s) {
    if (s == null) return '';
    var t = document.createElement('textarea');
    t.textContent = String(s);
    return t.innerHTML;
  }

  /**
   * Bound API for one base instance (call after base.init()).
   * @param {object} base
   */
  function dealStore(base) {
    return {
      collection: COLLECTION,
      bootstrap: function () {
        bootstrapData(base);
      },
      list: function () {
        return listDeals(base);
      },
      get: function (id) {
        return getDealById(base, id);
      },
      add: function (input) {
        return addDeal(base, input);
      },
      update: function (id, patch) {
        return updateDeal(base, id, patch);
      },
      removeById: function (id) {
        return removeDealById(base, id);
      },
      setStage: function (id, stage) {
        return updateDealStage(base, id, stage);
      },
      forContact: function (contactId) {
        return listDealsForContact(base, contactId);
      },
      forCompany: function (companyId) {
        return listDealsForCompany(base, companyId);
      },
      counts: function () {
        return countsByStage(base);
      }
    };
  }

  coffee.crm = {
    DEALS_COLLECTION: COLLECTION,
    CONTACTS_COLLECTION: CONTACTS_COLLECTION,
    COMPANIES_COLLECTION: COMPANIES_COLLECTION,
    ACTIVITIES_COLLECTION: ACTIVITIES_COLLECTION,
    ACTIVITY_TYPES: ACTIVITY_TYPES,
    LEGACY_LOCAL_KEY: LEGACY_KEY,
    STAGES: STAGES,
    STAGE_LIST: STAGE_LIST,
    ensureDealsCollection: ensureDealsCollection,
    migrateLegacyLocalStorage: migrateLegacyLocalStorage,
    seedDemoIfEmpty: seedDemoIfEmpty,
    bootstrapData: bootstrapData,
    bootstrapCompaniesData: bootstrapCompaniesData,
    bootstrapContactsData: bootstrapContactsData,
    bootstrapActivitiesData: bootstrapActivitiesData,
    bootstrapCrm: bootstrapCrm,
    listDeals: listDeals,
    getDealById: getDealById,
    listDealsForContact: listDealsForContact,
    listDealsForCompany: listDealsForCompany,
    addDeal: addDeal,
    updateDeal: updateDeal,
    removeDealById: removeDealById,
    updateDealStage: updateDealStage,
    countsByStage: countsByStage,
    normalizeStage: normalizeStage,
    companyLabel: companyLabel,
    listCompanies: listCompanies,
    getCompanyById: getCompanyById,
    addCompany: addCompany,
    updateCompany: updateCompany,
    removeCompanyById: removeCompanyById,
    companyStore: companyStore,
    listContacts: listContacts,
    getContactById: getContactById,
    addContact: addContact,
    updateContact: updateContact,
    removeContactById: removeContactById,
    contactStore: contactStore,
    listActivities: listActivities,
    getActivityById: getActivityById,
    addActivity: addActivity,
    removeActivityById: removeActivityById,
    listActivitiesForContact: listActivitiesForContact,
    listActivitiesForDeal: listActivitiesForDeal,
    listActivitiesForCompany: listActivitiesForCompany,
    activityStore: activityStore,
    normSearchTerm: normSearchTerm,
    matchesSearch: matchesSearch,
    searchDeals: searchDeals,
    searchContacts: searchContacts,
    searchCompanies: searchCompanies,
    searchActivities: searchActivities,
    searchCrm: searchCrm,
    escapeHtml: escapeHtml,
    dealStore: dealStore
  };

  window.coffee = coffee;
})();
