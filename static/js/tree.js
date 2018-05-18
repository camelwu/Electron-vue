;
(function($, window, document, undefined) {
    var pluginName = 'tree';

    var _default = {};

    _default.settings = {
        expandIcon: 'iconn-26',
        collapseIcon: 'iconn-24',
        emptyIcon: 'empty-icon',
        nodeIcon: '',
        selectedIcon: ''
    };

    _default.options = {
        silent: false,
        ignoreChildren: false
    };

    var Tree = function(element, options) {
        this.$element = $(element);
        this.elementId = element.id;
        this.styleId = this.elementId + '-style';

        this.init(options);

        return {

			// Options (public access)
            options: this.options,

			// Initialize / destroy methods
            init: $.proxy(this.init, this),

			// Get methods
            getNode: $.proxy(this.getNode, this),
            getParent: $.proxy(this.getParent, this),
            getSiblings: $.proxy(this.getSiblings, this),
            getSelected: $.proxy(this.getSelected, this),
            getUnselected: $.proxy(this.getUnselected, this),
            getExpanded: $.proxy(this.getExpanded, this),
            getCollapsed: $.proxy(this.getCollapsed, this),

			// Select methods
            selectNode: $.proxy(this.selectNode, this),
            unselectNode: $.proxy(this.unselectNode, this),
            toggleNodeSelected: $.proxy(this.toggleNodeSelected, this),

			// Expand / collapse methods
            collapseAll: $.proxy(this.collapseAll, this),
            collapseNode: $.proxy(this.collapseNode, this),
            expandAll: $.proxy(this.expandAll, this),
            expandNode: $.proxy(this.expandNode, this),
            toggleNodeExpanded: $.proxy(this.toggleNodeExpanded, this),
            revealNode: $.proxy(this.revealNode, this)
        };
    };

    Tree.prototype.init = function(options) {
        this.tree = [];
        this.nodes = [];

        if (options.data) {
            if (typeof options.data === 'string') {
                options.data = $.parseJSON(options.data);
            }
            this.tree = $.extend(true, [], options.data);
            delete options.data;
        }
        this.options = $.extend({}, _default.settings, options);
        this.subscribeEvents();
        this.setInitialStates({
            children: this.tree
        }, 0);
        this.render();
    };

    Tree.prototype.unsubscribeEvents = function() {
        this.$element.off('click');
        this.$element.off('nodeChecked');
        this.$element.off('nodeCollapsed');
        this.$element.off('nodeExpanded');
        this.$element.off('nodeSelected');
        this.$element.off('nodeUnselected');
    };

    Tree.prototype.subscribeEvents = function() {
        this.unsubscribeEvents();

        this.$element.on('click', $.proxy(this.clickHandler, this));

        if (typeof (this.options.onNodeCollapsed) === 'function') {
            this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
        }

        if (typeof (this.options.onNodeExpanded) === 'function') {
            this.$element.on('nodeExpanded', this.options.onNodeExpanded);
        }

        if (typeof (this.options.onNodeSelected) === 'function') {
            this.$element.on('nodeSelected', this.options.onNodeSelected);
        }

        if (typeof (this.options.onNodeUnselected) === 'function') {
            this.$element.on('nodeUnselected', this.options.onNodeUnselected);
        }
    };

    Tree.prototype.setInitialStates = function(node, level) {
        if (!node.children) { return; }
        level += 1;

        var parent = node;
        var _this = this;
        $.each(node.children, function checkStates(index, node) {
			// nodeId : unique, incremental identifier
            node.nodeId = _this.nodes.length;

			// parentId : transversing up the tree
            node.parentId = parent.nodeId;

			// if not provided set selectable default value
            if (!node.hasOwnProperty('selectable')) {
                node.selectable = true;
            }

			// where provided we should preserve states
            node.state = node.state || {};

			// set expanded state; if not provided based on levels
            if (!node.state.hasOwnProperty('expanded')) {
                if (!node.state.disabled && (level < _this.options.levels) &&
						(node.children && node.children.length > 0)) {
                    node.state.expanded = true;
                } else {
                    node.state.expanded = false;
                }
            }

			// set selected state; unless set always false
            if (!node.state.hasOwnProperty('selected')) {
                node.state.selected = false;
            }

			// index nodes in a flattened structure for use later
            _this.nodes.push(node);

			// recurse child nodes and transverse the tree
            if (node.children) {
                _this.setInitialStates(node, level);
            }
        });
    };

    Tree.prototype.clickHandler = function(event) {
        var target = $(event.target);
        var node = this.findNode(target);

        var classList = target.attr('class') ? target.attr('class').split(' ')
				: [];
        if ((classList.indexOf('expand-icon') !== -1)) {
            this.toggleExpandedState(node, _default.options);
            this.render();
        } else {
            if (node.selectable) {
                this.toggleSelectedState(node, _default.options);
            } else {
                this.toggleExpandedState(node, _default.options);
            }

            this.render();
        }
    };

    Tree.prototype.findNode = function(target) {
        var nodeId = target.closest('li.tree-li').attr('data-nodeid');
        var node = this.nodes[nodeId];

        if (!node) {
            console.log('Error: node does not exist');
        }
        return node;
    };

    Tree.prototype.setExpandedState = function(node, state, options) {
        if (state === node.state.expanded) { return; }

        if (state && node.children) {
			// Expand a node
            node.state.expanded = true;
            if (!options.silent) {
                this.$element.trigger('nodeExpanded', $.extend(true, {}, node));
            }
        } else if (!state) {
			// Collapse a node
            node.state.expanded = false;
            if (!options.silent) {
                this.$element
						.trigger('nodeCollapsed', $.extend(true, {}, node));
            }

			// Collapse child nodes
            if (node.children && !options.ignoreChildren) {
                $.each(node.children, $.proxy(function(index, node) {
                    this.setExpandedState(node, false, options);
                }, this));
            }
        }
    };

    Tree.prototype.toggleExpandedState = function(node, options) {
        if (!node) { return; }
        this.setExpandedState(node, !node.state.expanded, options);
    };

    Tree.prototype.toggleSelectedState = function(node, options) {
        if (!node) { return; }
        this.setSelectedState(node, !node.state.selected, options);
    };

    Tree.prototype.findNodes = function(pattern, modifier, attribute) {
        modifier = modifier || 'g';
        attribute = attribute || 'text';

        var _this = this;
        return $.grep(this.nodes, function(node) {
            var val = _this.getNodeValue(node, attribute);
            if (typeof val === 'string') {
                return val.match(new RegExp(pattern, modifier));
            }
        });
    };

    Tree.prototype.getNodeValue = function(obj, attr) {
        var index = attr.indexOf('.');
        if (index > 0) {
            var _obj = obj[attr.substring(0, index)];
            var _attr = attr.substring(index + 1, attr.length);
            return this.getNodeValue(_obj, _attr);
        } else {
            if (obj.hasOwnProperty(attr)) {
                return obj[attr].toString();
            } else {
                return undefined;
            }
        }
    };

    Tree.prototype.setSelectedState = function(node, state, options) {
        if (state === node.state.selected) { return; }

        if (state) {
			// If multiSelect false, unselect previously selected
            if (!this.options.multiSelect) {
                $.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(
						function(index, node) {
    this.setSelectedState(node, true, options);
}, this));
            }

			// Continue selecting node
            node.state.selected = true;
            if (!options.silent) {
                this.$element.trigger('nodeSelected', $.extend(true, {}, node));
            }
        } else {
			// Unselect node
            node.state.selected = true;
            if (!options.silent) {
                this.$element.trigger('nodeSelected', $
						.extend(true, {}, node));
            }
        }
    };

    Tree.prototype.buildTree = function(nodes, level) {
        if (!nodes) {
            return;
        }
        level += 1;

        var _this = this;
        $.each(nodes, function addNodes(id, node) {
            var levelClass;
            var iconLevelClass;
            switch (level)			{
                case 1:
                    levelClass = 'tree-li-1';
                    iconLevelClass = 'tree-iconn-1';
                    break;
                case 2:
                    levelClass = 'tree-li-2';
                    iconLevelClass = 'tree-iconn-2';
                    break;
                case 3:
                    levelClass = 'tree-li-3';
                    iconLevelClass = 'tree-iconn-3';
                    break;
                case 4:
                    levelClass = 'tree-li-4';
                    iconLevelClass = 'tree-iconn-4';
                    break;
                case 5:
                    levelClass = 'tree-li-5';
                    iconLevelClass = 'tree-iconn-5';
                    break;
                case 6:
                    levelClass = 'tree-li-6';
                    iconLevelClass = 'tree-iconn-6';
                    break;
                /* case 7:
                    levelClass = 'tree-li-7';
                    iconLevelClass = 'tree-iconn-7';
                    break;
                case 8:
                    levelClass = 'tree-li-8';
                    iconLevelClass = 'tree-iconn-8';
                    break;
                case 9:
                    levelClass = 'tree-li-9';
                    iconLevelClass = 'tree-iconn-9';
                    break; */
            }
            var treeItem = $(_this.template.item)
				.addClass(levelClass)
				.addClass('node-' + _this.elementId)
				.addClass(node.state.selected ? 'node-selected' : '')
				.attr('data-nodeid', node.nodeId);
            for (var i = 0; i < (level - 1); i++) {
                treeItem.append(_this.template.indent);
            }

            var classList = [];
			// 如果有子节点
            if (node.children.length != 0) {
                classList.push('expand-icon');
                if (node.state.expanded) {
                    classList.push(_this.options.expandIcon);
                } else {
                    classList.push(_this.options.collapseIcon);
                }
			// 没有子节点
            } else {
                classList.push(_this.options.emptyIcon);
            }
            classList.push(iconLevelClass);

            treeItem.append($(_this.template.icon).addClass(classList.join(' ')));

			// 添加节点icon
            if (_this.options.showIcon) {
                var classList = ['node-icon'];
                classList.push(node.icon || _this.options.nodeIcon);
                if (node.state.selected) {
                    classList.pop();
                    classList.push(node.selectedIcon ||
						_this.options.selectedIcon || node.icon ||
						_this.options.nodeIcon);
                }
                treeItem.append($(_this.template.icon).addClass(classList.join(' ')));
            }

			// 添加文本
            treeItem.append(node.deptName);

			// 添加到树
			// var treeItem_ = $(_this.template.list).append(treeItem);
            _this.$wrapper.append(treeItem);

            if (node.children && node.state.expanded && !node.state.disabled) {
                return _this.buildTree(node.children, level);
            }
        });
    };

    Tree.prototype.template = {
        list: '<ul></ul>',
        item: '<li class="tree-li"></li>',
        icon: '<em></em>',
        text: '<p></p>'
    };

    Tree.prototype.getNode = function(nodeId) {
        return this.nodes[nodeId];
    };

    Tree.prototype.render = function() {
        if (!this.initialized) {
			// Setup first time only components
            this.$element.addClass(pluginName);
            this.$wrapper = $(this.template.list);
            this.initialized = true;
        }
        this.$element.empty().append(this.$wrapper.empty());
		// Build tree
        this.buildTree(this.tree, 0);
    };

    $.fn[pluginName] = function(options, args) {
        var result;

        this.each(function() {
            var _this = $.data(this, pluginName);
            if (typeof options === 'string') {
                if (!_this) {
                    logError('Not initialized, can not call method : ' +
							options);
                } else if (!$.isFunction(_this[options]) ||
						options.charAt(0) === '_') {
                    logError('No such method : ' + options);
                } else {
                    if (!(args instanceof Array)) {
                        args = [ args ];
                    }
                    result = _this[options].apply(_this, args);
                }
            } else if (typeof options === 'boolean') {
                result = _this;
            } else {
                $.data(this, pluginName, new Tree(this, $.extend(true, {},
						options)));
            }
        });

        return result || this;
    };
})(jQuery, window, document);
