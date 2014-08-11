define(["mvc/dataset/states","mvc/dataset/dataset-list-element","mvc/tags","mvc/annotations","mvc/base-mvc","utils/localization"],function(h,e,f,a,i,b){var g=e.DatasetListItemView;var d=g.extend({initialize:function(j){g.prototype.initialize.call(this,j);this.hasUser=j.hasUser;this.purgeAllowed=j.purgeAllowed||false;this.tagsEditorShown=j.tagsEditorShown||false;this.annotationEditorShown=j.annotationEditorShown||false},_renderPrimaryActions:function(){var j=g.prototype._renderPrimaryActions.call(this);if(this.model.get("state")===h.NOT_VIEWABLE){return j}return g.prototype._renderPrimaryActions.call(this).concat([this._renderEditButton(),this._renderDeleteButton()])},_renderEditButton:function(){if((this.model.get("state")===h.DISCARDED)||(!this.model.get("accessible"))){return null}var l=this.model.get("purged"),j=this.model.get("deleted"),k={title:b("Edit attributes"),href:this.model.urls.edit,target:this.linkTarget,faIcon:"fa-pencil",classes:"edit-btn"};if(j||l){k.disabled=true;if(l){k.title=b("Cannot edit attributes of datasets removed from disk")}else{if(j){k.title=b("Undelete dataset to edit attributes")}}}else{if(_.contains([h.UPLOAD,h.NEW],this.model.get("state"))){k.disabled=true;k.title=b("This dataset is not yet editable")}}return faIconButton(k)},_renderDeleteButton:function(){if((!this.model.get("accessible"))){return null}var j=this,k=this.model.isDeletedOrPurged();return faIconButton({title:!k?b("Delete"):b("Dataset is already deleted"),disabled:k,faIcon:"fa-times",classes:"delete-btn",onclick:function(){j.$el.find(".icon-btn.delete-btn").trigger("mouseout");j.model["delete"]()}})},_renderDetails:function(){var j=g.prototype._renderDetails.call(this),k=this.model.get("state");if(!this.model.isDeletedOrPurged()&&_.contains([h.OK,h.FAILED_METADATA],k)){this._renderTags(j);this._renderAnnotation(j);this._makeDbkeyEditLink(j)}this._setUpBehaviors(j);return j},_renderSecondaryActions:function(){var j=g.prototype._renderSecondaryActions.call(this);switch(this.model.get("state")){case h.UPLOAD:case h.NEW:case h.NOT_VIEWABLE:return j;case h.ERROR:j.unshift(this._renderErrButton());return j.concat([this._renderRerunButton()]);case h.OK:case h.FAILED_METADATA:return j.concat([this._renderRerunButton(),this._renderVisualizationsButton()])}return j.concat([this._renderRerunButton()])},_renderErrButton:function(){return faIconButton({title:b("View or report this error"),href:this.model.urls.report_error,classes:"report-error-btn",target:this.linkTarget,faIcon:"fa-bug"})},_renderRerunButton:function(){return faIconButton({title:b("Run this job again"),href:this.model.urls.rerun,classes:"rerun-btn",target:this.linkTarget,faIcon:"fa-refresh"})},_renderVisualizationsButton:function(){var j=this.model.get("visualizations");if((this.model.isDeletedOrPurged())||(!this.hasUser)||(!this.model.hasData())||(_.isEmpty(j))){return null}if(!_.isObject(j[0])){this.warn("Visualizations have been switched off");return null}var k=$(this.templates.visualizations(j,this));this._addScratchBookFn(k.find(".visualization-link").addBack(".visualization-link"));return k},_addScratchBookFn:function(j){j.click(function(k){if(Galaxy.frame&&Galaxy.frame.active){Galaxy.frame.add({title:"Visualization",type:"url",content:$(this).attr("href")});k.preventDefault();k.stopPropagation()}})},_renderTags:function(j){if(!this.hasUser){return}var k=this;this.tagsEditor=new f.TagsEditor({model:this.model,el:j.find(".tags-display"),onshowFirstTime:function(){this.render()},onshow:function(){k.tagsEditorShown=true},onhide:function(){k.tagsEditorShown=false},$activator:faIconButton({title:b("Edit dataset tags"),classes:"tag-btn",faIcon:"fa-tags"}).appendTo(j.find(".actions .right"))});if(this.tagsEditorShown){this.tagsEditor.toggle(true)}},_renderAnnotation:function(j){if(!this.hasUser){return}var k=this;this.annotationEditor=new a.AnnotationEditor({model:this.model,el:j.find(".annotation-display"),onshowFirstTime:function(){this.render()},onshow:function(){k.annotationEditorShown=true},onhide:function(){k.annotationEditorShown=false},$activator:faIconButton({title:b("Edit dataset annotation"),classes:"annotate-btn",faIcon:"fa-comment"}).appendTo(j.find(".actions .right"))});if(this.annotationEditorShown){this.annotationEditor.toggle(true)}},_makeDbkeyEditLink:function(j){if(this.model.get("metadata_dbkey")==="?"&&!this.model.isDeletedOrPurged()){var k=$('<a class="value">?</a>').attr("href",this.model.urls.edit).attr("target",this.linkTarget);j.find(".dbkey .value").replaceWith(k)}},events:_.extend(_.clone(g.prototype.events),{"click .undelete-link":function(j){this.model.undelete();return false},"click .purge-link":"_confirmPurge"}),_confirmPurge:function c(j){this.model.purge();return false},toString:function(){var j=(this.model)?(this.model+""):("(no model)");return"HDAEditView("+j+")"}});d.prototype.templates=(function(){var k=_.extend({},g.prototype.templates.warnings,{failed_metadata:i.wrapTemplate(['<% if( dataset.state === "failed_metadata" ){ %>','<div class="failed_metadata-warning warningmessagesmall">',b("An error occurred setting the metadata for this dataset"),'<br /><a href="<%= dataset.urls.edit %>" target="<%= view.linkTarget %>">',b("Set it manually or retry auto-detection"),"</a>","</div>","<% } %>"],"dataset"),deleted:i.wrapTemplate(["<% if( dataset.deleted && !dataset.purged ){ %>",'<div class="deleted-msg warningmessagesmall">',b("This dataset has been deleted"),'<br /><a class="undelete-link" href="javascript:void(0);">',b("Undelete it"),"</a>","<% if( view.purgeAllowed ){ %>",'<br /><a class="purge-link" href="javascript:void(0);">',b("Permanently remove it from disk"),"</a>","<% } %>","</div>","<% } %>"],"dataset")});var j=i.wrapTemplate(["<% if( visualizations.length === 1 ){ %>",'<a class="visualization-btn visualization-link icon-btn" href="<%= visualizations[0].href %>"',' target="<%= visualizations[0].target %>" title="',b("Visualize in"),' <%= visualizations[0].html %>">','<span class="fa fa-bar-chart-o"></span>',"</a>","<% } else { %>",'<div class="visualizations-dropdown dropdown">','<a class="visualization-btn icon-btn" data-toggle="dropdown" title="',b("Visualize"),'">','<span class="fa fa-bar-chart-o"></span>',"</a>",'<ul class="dropdown-menu" role="menu">',"<% _.each( visualizations, function( visualization ){ %>",'<li><a class="visualization-link" href="<%= visualization.href %>"',' target="<%= visualization.target %>">',"<%= visualization.html %>","</a></li>","<% }); %>","</ul>","</div>","<% } %>"],"visualizations");return _.extend({},g.prototype.templates,{warnings:k,visualizations:j})}());return{EditableDatasetListItemView:d}});