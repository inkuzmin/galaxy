define(["mvc/dataset/states","mvc/collection/hdca-base","utils/localization"],function(a,e,b){var d=e.HDCABaseView;var c=d.extend({_renderPrimaryActions:function(){this.log(this+"._renderPrimaryActions");return d.prototype._renderPrimaryActions.call(this).concat([this._renderDeleteButton()])},_renderDeleteButton:function(){var g=this,f=this.model.get("deleted");return faIconButton({title:f?b("Dataset collection is already deleted"):b("Delete"),classes:"delete-btn",faIcon:"fa-times",disabled:f,onclick:function(){g.$el.find(".icon-btn.delete-btn").trigger("mouseout");g.model["delete"]()}})},toString:function(){var f=(this.model)?(this.model+""):("(no model)");return"HDCAEditView("+f+")"}});return{HDCAEditView:c}});