'use strict';

var removeDiacritics = require('diacritics').remove;
var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event'),
    domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query'),
    clear = require('min-dom/lib/clear');

function SnakeCaseIDsPlugin(elementRegistry, editorActions, canvas, modeling) {
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;

  var self = this;

  this.state = {
    open: false
  };

  editorActions.register({
    generateSnakeCaseIDs: function() {
      self.generateAndShow();
    }
  });

  this.addContainer(canvas.getContainer().parentNode);
}


SnakeCaseIDsPlugin.prototype.generateAndShow = function() {
  if (!this.state.open) {
    this.toggle();
  }
  this.generateIDs();
  this.showIDs();
};

SnakeCaseIDsPlugin.prototype.addContainer = function(container) {
  var self = this;
  var markup = '<div class="djs-snake-case-ids"> \
    <div class="djs-snake-case-ids-header"> \
      <span>Generate snake_case IDs</span> \
      <button class="djs-snake-case-ids-toggle-btn" title="Expandir/colapsar">&#9660;</button> \
    </div> \
    <div class="djs-snake-case-ids-container"> \
      <div class="djs-snake-case-ids-actions"> \
        <button class="generate-ids">Generate IDs</button> \
        <button class="rename-ids">Rename IDs</button> \
      </div> \
      <ul class="id-list"></ul> \
    </div> \
  </div>';
  this.element = domify(markup);

  container.appendChild(this.element);

  domEvent.bind(domQuery('.djs-snake-case-ids-toggle-btn', this.element), 'click', function() {
    self.toggle();
  });
  domEvent.bind(domQuery('.generate-ids', this.element), 'click', function() {
    self.generateIDs();
    self.showIDs();
  });
  domEvent.bind(domQuery('.rename-ids', this.element), 'click', function() {
    self.retry = 0;
    self.renameIDs();
  });

  this._makeDraggable();
};

SnakeCaseIDsPlugin.prototype.toggle = function() {
  var btn = domQuery('.djs-snake-case-ids-toggle-btn', this.element);
  if (this.state.open) {
    domClasses(this.element).remove('open');
    this.state.open = false;
    if (btn) btn.innerHTML = '&#9660;';
  } else {
    domClasses(this.element).add('open');
    this.state.open = true;
    if (btn) btn.innerHTML = '&#9650;';
  }
};

SnakeCaseIDsPlugin.prototype.generateIDs = function() {
  var self = this;
  var elements = this._elementRegistry._elements;
  this.technicalIds = {};
  Object.keys(elements).forEach(function(key) {
    if (elements[key].type != 'label') {
      var businessObject = elements[key].element.businessObject;
      if (businessObject != null && businessObject.name) {
        var technicalId = self._getSnakeCaseID(businessObject.name, businessObject);
        self.technicalIds[businessObject.id] = technicalId;
      }
    }
  });
  this._verifyDuplicateIds();
};

SnakeCaseIDsPlugin.prototype._verifyDuplicateIds = function() {
  var self = this;
  var values = {};
  Object.keys(this.technicalIds).forEach(function(technicalId) {
    var newTechnicalId = self.technicalIds[technicalId];
    if (values[newTechnicalId] != null) {
      values[newTechnicalId] = values[newTechnicalId] + 1;
      self.technicalIds[technicalId] = self.technicalIds[technicalId] + '_' + values[newTechnicalId];
    } else {
      values[newTechnicalId] = 0;
    }
  });
};

SnakeCaseIDsPlugin.prototype.showIDs = function() {
  var self = this;
  var idList = domQuery('.id-list', this.element);
  clear(idList);

  if (this.technicalIds != null) {
    Object.keys(this.technicalIds).forEach(function(technicalId) {
      if (technicalId == self.technicalIds[technicalId]) {
        idList.append(domify('<li>' + technicalId + ' --> ' + self.technicalIds[technicalId] + '</li>'));
      } else {
        idList.append(domify('<li>' + technicalId + ' --> <span style="background-color:#ffbc00">' + self.technicalIds[technicalId] + '</span></li>'));
      }
    });
  }
};

SnakeCaseIDsPlugin.prototype.renameIDs = function() {
  var self = this;

  Object.keys(this.technicalIds).forEach(function(technicalId) {
    if (technicalId != self.technicalIds[technicalId] && self._elementRegistry.get(self.technicalIds[technicalId]) != null) {
      self.retry = self.retry + 1;
    } else {
      var element = self._elementRegistry.get(technicalId);
      var properties = {
        id: self.technicalIds[technicalId]
      };
      self._modeling.updateProperties(element, properties);
    }
  });

  if (self.retry > 0 && self.retry < 100) {
    this.renameIDs();
  }
};

SnakeCaseIDsPlugin.prototype._getSnakeCaseID = function(name, businessObject) {
  var type = businessObject.$type;
  name = removeDiacritics(name);
  name = name.replace(/[^\w\s]/gi, '');

  if (type === 'bpmn:Process') {
    name = this._toPascalCase(name);
    if (!isNaN(name.charAt(0))) {
      name = 'N' + name;
    }
    return name;
  }

  name = this._toSnakeCase(name);
  if (!isNaN(name.charAt(0))) {
    name = 'n_' + name;
  }

  return this._getPrefix(businessObject) + name;
};

SnakeCaseIDsPlugin.prototype._toPascalCase = function(str) {
  var camel = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

SnakeCaseIDsPlugin.prototype._getEventDefinitionType = function(businessObject) {
  var definitions = businessObject.eventDefinitions || [];
  if (definitions.length === 0) return 'none';
  var defType = definitions[0].$type;
  if (defType === 'bpmn:TimerEventDefinition') return 'timer';
  if (defType === 'bpmn:MessageEventDefinition') return 'message';
  if (defType === 'bpmn:SignalEventDefinition') return 'signal';
  if (defType === 'bpmn:ErrorEventDefinition') return 'error';
  if (defType === 'bpmn:EscalationEventDefinition') return 'escalation';
  if (defType === 'bpmn:CompensateEventDefinition') return 'compensation';
  if (defType === 'bpmn:LinkEventDefinition') return 'link';
  if (defType === 'bpmn:ConditionalEventDefinition') return 'conditional';
  if (defType === 'bpmn:CancelEventDefinition') return 'cancel';
  return 'other';
};

SnakeCaseIDsPlugin.prototype._getPrefix = function(businessObject) {
  var type = businessObject.$type;

  var defType = this._getEventDefinitionType(businessObject);

  if (type === 'bpmn:StartEvent') {
    if (defType === 'timer') return 'tse_';
    if (defType === 'message') return 'mse_';
    if (defType === 'signal') return 'sse_';
    if (defType === 'error') return 'errse_';
    return 'se_';
  }
  if (type === 'bpmn:EndEvent') {
    if (defType === 'message') return 'mee_';
    if (defType === 'signal') return 'see_';
    if (defType === 'error') return 'erree_';
    return 'ee_';
  }
  if (type === 'bpmn:IntermediateCatchEvent') {
    if (defType === 'timer') return 'tce_';
    if (defType === 'message') return 'mce_';
    if (defType === 'signal') return 'sce_';
    if (defType === 'link') return 'lce_';
    if (defType === 'conditional') return 'cce_';
    return 'ice_';
  }
  if (type === 'bpmn:IntermediateThrowEvent') {
    if (defType === 'message') return 'mte_';
    if (defType === 'signal') return 'ste_';
    if (defType === 'link') return 'lte_';
    if (defType === 'compensation') return 'cte_';
    if (defType === 'escalation') return 'ete_';
    return 'te_';
  }
  if (type === 'bpmn:BoundaryEvent') {
    if (defType === 'timer') return 'tbe_';
    if (defType === 'message') return 'mbe_';
    if (defType === 'error') return 'ebe_';
    if (defType === 'escalation') return 'esbe_';
    if (defType === 'cancel') return 'cbe_';
    if (defType === 'compensation') return 'cmpbe_';
    if (defType === 'conditional') return 'cndbe_';
    if (defType === 'signal') return 'sbe_';
    return 'be_';
  }
  if (type === 'bpmn:SubProcess') {
    var isEventSubProcess = businessObject.triggeredByEvent === true || businessObject.triggeredByEvent === 'true';
    return isEventSubProcess ? 'esubp_' : 'subp_';
  }

  var prefixMap = {
    // Tasks
    'bpmn:Task':               't_',
    'bpmn:UserTask':           'ut_',
    'bpmn:ServiceTask':        'srvt_',
    'bpmn:ScriptTask':         'scrt_',
    'bpmn:BusinessRuleTask':   'brt_',
    'bpmn:ManualTask':         'mt_',
    'bpmn:SendTask':           'sndt_',
    'bpmn:ReceiveTask':        'rcvt_',
    // Gateways
    'bpmn:ExclusiveGateway':   'gtw_',
    'bpmn:InclusiveGateway':   'igtw_',
    'bpmn:ParallelGateway':    'pgtw_',
    'bpmn:ComplexGateway':     'cgtw_',
    'bpmn:EventBasedGateway':  'ebgtw_',
    // Sub-processes & activities
    'bpmn:AdHocSubProcess':    'ahsubp_',
    'bpmn:CallActivity':       'cat_',
    // Flows & connections
    'bpmn:SequenceFlow':       'sf_',
    'bpmn:MessageFlow':        'mf_',
    'bpmn:Association':        'assoc_',
    // Data
    'bpmn:DataObjectReference': 'do_',
    'bpmn:DataStoreReference':  'ds_',
    // Containers
    'bpmn:Participant':        'pool_',
    'bpmn:Lane':               'ln_',
    'bpmn:Group':              'grp_',
    // Annotations
    'bpmn:TextAnnotation':     'ta_'
  };
  return prefixMap[type] || '';
};

// Converts a string (words separated by spaces, or PascalCase/camelCase) to snake_case
SnakeCaseIDsPlugin.prototype._toSnakeCase = function(str) {
  return str
    .trim()
    .replace(/([A-Z])/g, ' $1')       // split PascalCase/camelCase on uppercase letters
    .replace(/[\s_]+/g, '_')           // collapse spaces and underscores
    .replace(/^_|_$/g, '')             // strip leading/trailing underscores
    .toLowerCase();
};


SnakeCaseIDsPlugin.prototype._makeDraggable = function() {
  var el = this.element;
  var header = domQuery('.djs-snake-case-ids-header', el);
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  // Convert CSS bottom-based position to top-based so drag and collapse work correctly
  setTimeout(function() {
    el.style.top = el.offsetTop + 'px';
    el.style.bottom = 'auto';
  }, 0);

  header.onmousedown = function(e) {
    if (e.target.classList.contains('djs-snake-case-ids-toggle-btn')) return;
    e = e || window.event;
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;

    document.onmouseup = function() {
      document.onmouseup = null;
      document.onmousemove = null;
    };
    document.onmousemove = function(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = (el.offsetTop - pos2) + 'px';
      el.style.left = (el.offsetLeft - pos1) + 'px';
    };
  };
};

SnakeCaseIDsPlugin.$inject = ['elementRegistry', 'editorActions', 'canvas', 'modeling'];

module.exports = {
  __init__: ['snakeCaseIDsPlugin'],
  snakeCaseIDsPlugin: ['type', SnakeCaseIDsPlugin]
};
