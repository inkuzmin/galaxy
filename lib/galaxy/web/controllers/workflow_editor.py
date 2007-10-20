from galaxy.web.base.controller import *

from galaxy.tools.parameters import DataToolParameter
from galaxy.tools import DefaultToolState
from galaxy.datatypes.data import Data

class WorkflowEditor( BaseController ):
    beta = True
    
    @web.expose
    def index( self, trans ):
        return trans.fill_template( "workflow_editor/index.mako" )
    
    @web.expose
    def canvas( self, trans ):
        return trans.fill_template( "workflow_editor/canvas.mako" )
        
    @web.json
    def tool_form( self, trans, tool_id=None, **incoming ):
        trans.workflow_building_mode = True
        tool = trans.app.toolbox.tools_by_id[tool_id]
        state = DefaultToolState()
        state.decode( incoming.pop("tool_state"), tool, trans.app )
        errors = tool.update_state( trans, tool.inputs_by_page[state.page], state.inputs, incoming )
        rval = {}
        rval['form_html'] = trans.fill_template( "workflow_editor/tool_form.mako", tool=tool, as_html=as_html, values=state.inputs )
        rval['state'] = state.encode( tool, trans.app )
        return rval
        
    @web.json
    def get_tool_info( self, trans, tool_id ):
        trans.workflow_building_mode = True
        tool = trans.app.toolbox.tools_by_id[tool_id]
        rval = {}
        rval['name'] = tool.name
        rval['tool_id'] = tool.id
        data_inputs = []
        for name, input in tool.inputs.iteritems():
            if isinstance( input, DataToolParameter ):
                data_inputs.append( dict( name=input.name, label=input.label, extensions=input.extensions ) )
        rval['data_inputs'] = data_inputs
        data_outputs = []
        for name, ( format, metadata_source, parent ) in tool.outputs.iteritems():
            data_outputs.append( dict( name=name, extension=format ) )
        rval['data_outputs'] = data_outputs
        state = tool.new_state( None )
        rval['form_html'] = trans.fill_template( "workflow_editor/tool_form.mako", tool=tool, as_html=as_html, values=state.inputs )
        rval['state'] = state.encode( tool, trans.app )
        return rval
        
    @web.json
    def get_datatypes( self, trans ):
        ext_to_class_name = dict()
        classes = []
        for k, v in trans.app.datatypes_registry.datatypes_by_extension.iteritems():
            c = v.__class__
            ext_to_class_name[k] = c.__module__ + "." + c.__name__
            classes.append( c )
        class_to_classes = dict()
        def visit_bases( types, cls ):
            for base in cls.__bases__:
                if issubclass( base, Data ):
                    types.add( base.__module__ + "." + base.__name__ )
                visit_bases( types, base )
        for c in classes:      
            n =  c.__module__ + "." + c.__name__
            types = set( [ n ] )
            visit_bases( types, c )
            class_to_classes[ n ] = dict( ( t, True ) for t in types )
        return dict( ext_to_class_name=ext_to_class_name, class_to_classes=class_to_classes )
        
def as_html( param, value, trans, prefix ):
    if type( param ) is DataToolParameter:
        return "Data input '" + param.name + "' (" + ( " or ".join( param.extensions ) ) + ")"
    else:
        return param.get_html_field( trans, value ).get_html( prefix )