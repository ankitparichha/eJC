
//Declarations
var tsmcsm = [];
var productPartNo = "";
var AuxiliaryFormNo = "";
var OECDNameAndAddress = "";
var OECDCity = "";
var OECDPhoneNumber = "";
var clientContext;
var jobCode;
var startWF;
var prodtypetxt = "NA";
var vehtyptxt = "NA";
var vehmaketxt = "NA";
var customercmplnttxt = "NA";
var jobcodetempno;
var currentUser;
var CurrentUserID;
var AllowedProducts = [];
var todaydate;
var loggedinUserGroup;
var ReferenceNumber;
var GroupOfUser;

var GroupsPresent = [];


$(document).ready(function () {
    SP.SOD.executeFunc('MicrosoftAjax.js', 'SP.ClientContext', insureSPServices(InitializePage));


    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', CheckCurrentUserMembership());


    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', GroupCheck);
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', LoadDynamicData);
    $("#hrefHomeUrl").attr("href", GetSiteURL());

    ExecuteOrDelayUntilScriptLoaded(CheckCurrentUserMembership, "sp.js");
    //IsMemberofBoschDealer("BOSCHDealer");

    $("#txtAuxiliaryFormNo, #txtCustomerPhoneNumber, #txtOECDPhoneNumber").bind({
        copy: function () {
            return;
        },
        paste: function () {
            return;
        },
        cut: function () {
            return;
        }
    });


    $("#fileUpload").on('change', function () {
        var filesCount = $("#fileUpload")[0].files.length;
        $("#image-holder").empty();
        var uploadedFileNames = '';
        if (filesCount > 0) {
            uploadedFileNames = '<div>Selected File(s)</div>';
            for (var i = 0; i < filesCount; i++) {
                filename = $("#fileUpload")[0].files[i].name;
                var extn = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
                if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg" || extn == "pdf" || extn == "doc" || extn == "docx" || extn == "xls" || extn == "xlsx") {
                    uploadedFileNames += (i + 1).toString() + ") " + filename + "<br/>";
                }
                else {
                    uploadedFileNames = '';
                    document.getElementById("fileUpload").value = "";
                    alert("Pls select only images/PDF/Doc/Excel Type");
                    break;
                }
            }
        }
        $("#image-holder")[0].innerHTML = uploadedFileNames;
    });


    $("#txtProductPartNumber").autocomplete({
        maxResults: 6,
        source: function (request, response) {
            var results = $.ui.autocomplete.filter(productPartNo, request.term);

            response(results.slice(0, this.options.maxResults));
        }
    });
});

//Check if the user is member of a given group
function CheckCurrentUserMembership() {
    var loggedinUserGroup = "";
	var siteURL = GetSiteURL();
    var CurrentUserName = $().SPServices.SPGetCurrentUser({
	webURL: siteURL,
	fieldName: "Name",

	debug: false
	});

    $().SPServices({
	webURL: siteURL,
        operation: "GetGroupCollectionFromUser",
        userLoginName: CurrentUserName,
        async: false,
        completefunc: function (xData, Status) {
            $(xData.responseXML).find("Group").each(function () {
                loggedinUserGroup = loggedinUserGroup + " " + $(this).attr("Name");
                if ($(this).attr("Name") == "BOSCHDealer") {
                    window.location.href = GetSiteURL() + "/SitePages/BoschDealerNewJobCard.aspx";
                }
				else if ($(this).attr("Name") == "AASpares") {
                    window.location.href = GetSiteURL() + "/SitePages/AASpares.aspx";
                }
				
            });
            console.log(loggedinUserGroup);
        }
    });
}
function IsMemberofBoschDealer(groupName) {
    var requestUri = GetSiteURL() + '/_vti_bin/web/currentuser/?$expand=groups';
    //var ddlVehicleListUrl = GetSiteURL(); //"/_api/web/lists/getByTitle('Vehicle_Mapping')/items?$select=Title,Id,VehicleType/Id,VehicleType/Title&$filter=((VehicleType/Id eq '" + option + "')and(IsActive eq 1))&$expand=VehicleType";
    // + "&@TargetLibrary='" + VehicleLibrary + "'" ;
    //ddlVehicleListUrl = ddlVehicleListUrl + "/_vti_bin/ListData.svc/Vehicle_Mapping?$select=Vehicle_Name,Id,VehicleType/Id,VehicleType/Vehicle_Desc&$expand=VehicleType&$filter=((VehicleType/Id eq " + option + " )and(IsActive eq true))";

    var requestHeaders = { "accept": "application/json;odata=verbose" };
    $.ajax({
        url: requestUri,
        contentType: "application/json;odata=verbose",
        headers: requestHeaders,
        success: function (data, request) {
            var userGroups = data.d.Groups.results;
            userGroups.forEach(function (value, index) {
                if (value.LoginName == groupName)
                    console.log("Yes");
            });
        },
        error: function (p1, p2) {
            console.log("Something went wrong in getting Group check of " + groupName);
        }
    });
}

function OnQuerySucceeded() {
    var isMember = false;
    var groupsEnumerator = this.userGroups.getEnumerator();
    while (groupsEnumerator.moveNext()) {
        var group = groupsEnumerator.get_current();
        if (group.get_title() == "BOSCHDealer") {
            isMember = true;
            alert('Success');
            break;
			
        }
		else if (group.get_title() == "AASpares") {
            isMember = true;
            alert('Success');
            break;
		}
    }
    OnResult(isMember);
}

function OnQueryFailed() {
    OnResult(false);
}

//DatePicker 
$(function () {
    var currentDate = new Date();
    $('.datepickerclass').datepicker({
        changeMonth: true,
        changeYear: true,
        pickTime: false,
        inline: true,
        showOtherMonths: true,
        dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dateFormat: 'dd/mm/yy',
        showOn: "button",
        buttonImage: "../SiteAssets/Images/icons/Calendar.png",
        buttonImageOnly: true,
        buttonText: "Select Date"
    });

});
//Button Clicks
function btnSubmitClick() {

    if (validations()) {
        SubmitData();

        //Submit once only
        document.getElementById("btnSubmit").disabled = true;
    }
    else { alert('Please check the errors..!!'); }

}
function btnSaveClick() {
    if (validations()) {
        saveOEDealerEntyInfo();
    }
    else { alert('Please check the errors..!!'); }
}
function btnResetClick() {
    ClearFields();
    $( "#image-holder" ).empty();
}
function btnCancelClick() {
    //window.location.replace(_spPageContextInfo.webAbsoluteUrl);
    window.location.replace(_spPageContextInfo.webServerRelativeUrl);
}
//All Drop Down Change
$(document).on('keypress', '#txtEntryDate', function (event) {
    var charCode = event.charCode;

    if (charCode != 0) {
        $('#txtEntryDate').attr('readonly', true);
        $('#txtEntryDate').attr('disabled', true);
        alert('You cant change entry date..');
        event.preventDefault();
    }


});
$(document).on('change', "#ddlProductType", function () {
    var option = $(this).find('option:selected').text();
    if (option == "Others") {
        $(this).next().after("<div><input type='text' id='txtddlProductType' required/> <span class='asterisk'> * </span></div>");
    }
    else
        $('#txtddlProductType').parent().remove();
    showHideOEDealerDetails(option);
    if ($('#ddlServiceCenterCity option:selected').val() != 0)
    { GetServiceCenterByCity($('#ddlServiceCenterCity option:selected').val(), $(this).find('option:selected').val()); }


});
$(document).on('change', "#ddlVehicleType", function () {
    var option = $(this).find('option:selected').val();
    selectedvalue = $('#ddlVehicleType option:selected').text();
    if (selectedvalue == "Others")
    { $('#ddlVehicleType').after("<input type='text' id='txtddlVehicleType'/>"); }
    else
    { $('#txtddlVehicleType').remove(); }
    $('#txtddlVehicleMake').remove();
    //GetLISTItemsByREST_API('master_vehicle','ddlVehicleType');
    GetVehicleByVehicleType(option);
});
$(document).on('change', "#ddlVehicleMake", function () {
    var option = $(this).find('option:selected').text();

    selectedvalue = $('#ddlVehicleMake option:selected').text();
    if (selectedvalue == "Others")
        $('#ddlVehicleMake').after("<input type='text' id='txtddlVehicleMake'/>");
    else
        $('#txtddlVehicleMake').remove();
});
$(document).on('change', "#ddlState", function () {
    var option = $(this).find('option:selected').val();
    $('#ddlServiceCenterCity').empty();
    $('#ddlServiceCenterCity').append($('<option>', {
        value: 0,
        text: "Select"
    }));

    $('#ddlServiceCenterName').empty();
    $('#ddlServiceCenterName').append($('<option>', {
        value: 0,
        text: "Select"
    }));

    $("#txtAreaServiceCentreAddress").val("");

    GetCityByState(option);
});
$(document).on('change', "#ddlServiceCenterCity", function () {
    var option = $(this).find('option:selected').val();
    GetServiceCenterByCity(option, $('#ddlProductType option:selected').val());
});
$(document).on('change', "#ddlServiceCenterName", function () {
    var option = $(this).find('option:selected').val();
    GetServiceCenterDetailsByName(option);
});
$(document).on('change', "#ddlCustomerComplaint", function () {
    selectedvalue = $('#ddlCustomerComplaint option:selected').text();
    if (selectedvalue == "Others")
        $('#ddlCustomerComplaint').after("<input type='text' id='txtddlCustomerComplaint'/>");
    else
        $('#txtddlCustomerComplaint').remove();
});
$(function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    todaydate = dd + '/' + mm + '/' + yyyy;
    $('#txtEntryDate').val(todaydate);


});
function insureSPServices(callbackFunction) {
    if ($().SPServices == null) {
        jQuery.getScript("../SiteAssets/jquery.SPServices-2014.02.min.js", callbackFunction);
    }
    else {
        callbackFunction.call("Already Loaded", null);
    }
}
function InitializePage(textStatus, data) {
    console.log(textStatus);
    //getCurrentUser();
}
function LoadDynamicData() {
    clientContext = new SP.ClientContext.get_current();
    GetReferenceNumber();

    GetLISTItemsByREST_API('Master_State', 'ddlState');
    GetLISTItemsByREST_API('Master_vehicletype', 'ddlVehicleType');
    GetLISTItemsByREST_API('Master_Customer_Complaints', 'ddlCustomerComplaint');

}
function GetVehicleByVehicleType(option, VehicleMake) {
    $('#ddlVehicleMake').empty();
    $('#ddlVehicleMake').append($('<option>', {
        value: 0,
        text: "Select"
    }));

    //ddlVehicleType

    //var VehicleLibrary='master_vehicle';
    var ddlVehicleListUrl = GetSiteURL(); //"/_api/web/lists/getByTitle('Vehicle_Mapping')/items?$select=Title,Id,VehicleType/Id,VehicleType/Title&$filter=((VehicleType/Id eq '" + option + "')and(IsActive eq 1))&$expand=VehicleType";
    // + "&@TargetLibrary='" + VehicleLibrary + "'" ;
    ddlVehicleListUrl = ddlVehicleListUrl + "/_vti_bin/ListData.svc/Vehicle_Mapping?$select=Vehicle_Name,Id,VehicleType/Id,VehicleType/Vehicle_Desc&$expand=VehicleType&$filter=((VehicleType/Id eq " + option + " )and(IsActive eq true))";

    $.ajax({

        url: ddlVehicleListUrl,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (data) {
            $.each(data.d.results, function (index, item) {

                $('#ddlVehicleMake').append($('<option>', {

                    value: item.Id,
                    text: item.Vehicle_Name

                }));

            });
            //var VehicleMakefun=VehicleMake..toString();
            if (typeof VehicleMake != 'undefined' && VehicleMake != null) {
                $("#ddlVehicleMake").val(VehicleMake);
            }
            //else {$('#ddlVehicleMake').prop('selectedIndex', 0);}
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }

    });
}

function GetCityByState(option) {


    //var ServiceCenterCity='master_vehicle';
    var url = GetSiteURL();
    //"/_api/web/lists/getByTitle('ServiceCentreCityMapping')/items?$select=Title,Id,State/Id&$filter=((State/Id //eq '" + option + "')and(IsActive eq 1))&$expand=State";
    url = url + "/_vti_bin/ListData.svc/ServiceCentreCityMapping?$select=City,Id,State/Id&$expand=State&$filter=((State/Id eq " + option + ")and(IsActive eq true))";

    // + "&@TargetLibrary='" + VehicleLibrary + "'" ;

    $.ajax({

        url: url,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (data) {
            $.each(data.d.results, function (index, item) {
                $('#ddlServiceCenterCity').append($('<option>', {
                    value: item.Id,
                    text: item.City
                }));

            });
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }

    });
}
function GetServiceCenterByCity(option, productType, SelectedServiceCentreName) {
    $('#ddlServiceCenterName').empty();
    $('#ddlServiceCenterName').append($('<option>', {
        value: 0,
        text: "Select"
    }));

    //ddlVehicleType

    //var VehicleLibrary='master_vehicle';
    var ddlVehicleListUrl = GetSiteURL();// window.location.protocol + "//" + window.location.host; //"/_api/web/lists/getByTitle('BOSCH_Dealer_Mapping')/items?$select=Title,Id,City/Id,City/Title,AllowedProductTypes/Id&$filter=((City/Id eq '" + option + "')and(AllowedProductTypes/Id eq'" + productType + "')and(IsActive eq 1))&$expand=City,AllowedProductTypes";
    // + "&@TargetLibrary='" + VehicleLibrary + "'" ;
    ddlVehicleListUrl = ddlVehicleListUrl + "/_vti_bin/ListData.svc/BOSCH_Dealer_Mapping?$select=BSName,Id,City/Id,City/City,AllowedProductTypes/Id&$expand=City,AllowedProductTypes&$filter=((City/Id eq " + option + ")and(IsActive eq true))"; //(AllowedProductTypes/Id eq " + productType + ")

    $.ajax({

        url: ddlVehicleListUrl,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (data) {
            $.each(data.d.results, function (index, item) {
            var itemLength = item.AllowedProductTypes.results.length;
                for (count = 0; count < itemLength; count++) {

                    if (!(typeof (item.AllowedProductTypes.results[count]) == "undefined")) {
                        if (item.AllowedProductTypes.results[count].Id == productType)
                            $('#ddlServiceCenterName').append($('<option>', {

                                value: item.Id,
                                text: item.BSName

                            }));
                    }
                }
                //}
            });
            //var VehicleMakefun=VehicleMake..toString();
            if (typeof SelectedServiceCentreName != 'undefined') {
                $("#ddlServiceCenterName").val(SelectedServiceCentreName);
            }
            //else {$('#ddlVehicleMake').prop('selectedIndex', 0);}
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }

    });
}
function saveOEDealerEntyInfo() {
    var CurrentReferenceNumber = ReferenceNumber;
    var radioisWarranty = $('input:radio[name=isWarranty]:checked').val();
    //var ServicePartnerCode = $("#txtServicePartnerCode").val();
    var ProductType = Number($("#ddlProductType").val());
    var selectedProduct = $("#ddlProductType option:selected").text();
    if (selectedProduct == 'Others') {
        prodtypetxt = $('#txtddlProductType').val();
    }



    //All Time Fields
    var ReportTime = $("#ddlReportTime option:selected").text();//.replace(/am+$/, ''); 
    var SaleTime = $("#ddlSaleTime option:selected").text();//.replace(/am+$/, ''); 
    var ComplaintTime = $("#ddlComplaintTime option:selected").text();//.replace(/am+$/, ''); 
    var RepairTime = $("#ddlRepairTime option:selected").text();//.replace(/am+$/, '');		
    //All Date
    var ReportDate = convertDate($("#txtReportDate").val(), ReportTime);
    var SaleDate = convertDate($("#txtSaleDate").val(), SaleTime);
    var RepairEndDate = convertDate($("#txtRepairEndDate").val(), ComplaintTime);
    var ComplaintDate = convertDate($("#txtComplaintDate").val(), RepairTime);
    var EntryDate = convertDate($("#txtEntryDate").val());
    if ($("#txtAuxiliaryFormNo").val() != null) {
        AuxiliaryFormNo = $("#txtAuxiliaryFormNo").val();
        OECDNameAndAddress = removeJunkChar('txtAreaOECDNameAndAddress');
        OECDCity = $("#txtOECDCity").val();
        OECDPhoneNumber = $("#txtOECDPhoneNumber").val();
    }
    //Customer Details
    var CustomerDetails = removeJunkChar('txtAreaCustomerDetails');
    var CustomerCity = $("#txtCustomerCity").val();
    var CustomerPhoneNumber = $("#txtCustomerPhoneNumber").val();
    //Customer Complaint
    var CustomerComplaint = $("#ddlCustomerComplaint").val();
    if ($("#ddlCustomerComplaint option:selected").text() == 'Others') {
        customercmplnttxt = $('#txtddlCustomerComplaint').val();
    }
    var CustomerComplaintDesc = removeJunkChar('txtAreaCustomerComplaintDesc');
    //BOSCH Service Centre Details
    var State = Number($("#ddlState").val());
    var ServiceCenterCity = Number($("#ddlServiceCenterCity").val());
    var ServiceCenterName = Number($("#ddlServiceCenterName").val());
    var ServiceCentreAddress = removeJunkChar('txtAreaServiceCentreAddress');
    //Vehicle Details			
    var VehicleType = Number($('#ddlVehicleType').val());
    if ($('#ddlVehicleType option:selected').text() == 'Others') {
        vehtyptxt = $('#txtddlVehicleType').val();
    }
    var VehicleMake = Number($("#ddlVehicleMake").val());
    if ($("#ddlVehicleMake").text() == 'Others') {
        vehmaketxt = $('#txtddlVehicleMake').val();
    }
    var VehicleModel = $("#txtVehicleModel").val();
    var VehicleRegNo = $("#txtVehicleRegNo").val();
    var EngineNumber = $("#txtEngineNumber").val();
    var VINChassisNumber = $("#txtVINChassisNumber").val();
    var KMSCovered = $("#txtKMSCovered").val();
    var HrsCovered = $("#txtHrsCovered").val();
	//var GroupOfUser = UserGroupCheck();
	
	var siteURL = GetSiteURL();
    var CurrentUserName = $().SPServices.SPGetCurrentUser({
	webURL: siteURL,
	fieldName: "Name",

	debug: false
	});
	var AvailGroups = ["TML", "VECV","CNH", "SMLI","FML"];
   // var GroupsPresent = [];
        $().SPServices({

	    webURL: siteURL,
            operation: "GetGroupCollectionFromUser",

            userLoginName: CurrentUserName,

            async: false,

            completefunc: function (xData, Status) {

                for (var i = 0; i < AvailGroups.length; i++) {
                    if ($(xData.responseXML).find("Group[Name='" + AvailGroups[i] + "']").length == 1) {
                        GroupsPresent.push(AvailGroups[i]);

                    }
                }
			}
		});
				
				//var groups = GroupsPresent[0]
				
				//var userGroup = '';
    var context = new SP.ClientContext.get_current();
    this.currentUser = context.get_web().get_currentUser();
    CurrentUserID = _spPageContextInfo.userId;
   
			/*for(var i = 0 ; i < groups.length ; i++)
			{
				userGroup = userGroup.concat(groups[i]);
				
				
			}*/
			var GroupOfUser = GroupsPresent[0];
	
    clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle("JOBCardMasterList");
    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);

    //Adding Data
    //oListItem.set_item("ServicePartnerCode", ServicePartnerCode);
    //oListItem.set_item("JOBCard", CurrentReferenceNumber);
    oListItem.set_item("ReferenceNumber", CurrentReferenceNumber);
    oListItem.set_item("isWarranty", radioisWarranty);
    oListItem.set_item("ProductType", ProductType);
    //Date
    if (ReportDate != null) {
        oListItem.set_item("ReportDate", ReportDate);
    }
    if (SaleDate != null) {
        oListItem.set_item("SaleDate", SaleDate);
    }
    if (RepairEndDate != null)
        oListItem.set_item("RepairEndDate", RepairEndDate);
    oListItem.set_item("ComplaintDate", ComplaintDate);
    oListItem.set_item("EntryDate", EntryDate);

    //OECD Details
    oListItem.set_item("AuxiliaryFormNo", AuxiliaryFormNo);
    oListItem.set_item("OECDNameAndAddress", OECDNameAndAddress);
    oListItem.set_item("OECDCity", OECDCity);
    oListItem.set_item("OECDPhoneNumber", OECDPhoneNumber);
    //Customer Details			
    oListItem.set_item("CustomerDetails", CustomerDetails);
    oListItem.set_item("CustomerCity", CustomerCity);
    oListItem.set_item("CustomerPhoneNumber", CustomerPhoneNumber);
    oListItem.set_item("CustomerComplaint", CustomerComplaint);
    oListItem.set_item("CustomerComplaintDesc", CustomerComplaintDesc);
    //BOSCH Service Centre
    oListItem.set_item("State", State);
    oListItem.set_item("ServiceCenterCity", ServiceCenterCity);
    oListItem.set_item("ServiceCenterName", ServiceCenterName);
    oListItem.set_item("ServiceCentreAddress", ServiceCentreAddress);
    //Vehicle Details
    oListItem.set_item("VehicleType", VehicleType);
    oListItem.set_item("VehicleMake", VehicleMake);
    oListItem.set_item("VehicleModel", VehicleModel);
    oListItem.set_item("VehicleRegNo", VehicleRegNo);
    oListItem.set_item("EngineNumber", EngineNumber);
    oListItem.set_item("VINChassisNumber", VINChassisNumber);
    oListItem.set_item("KMSCovered", KMSCovered);
    oListItem.set_item("HrsCovered", HrsCovered);
	oListItem.set_item("OEMGroup", GroupOfUser);


    //If any other option selected			
    oListItem.set_item("OtherVehicleType", vehtyptxt);
    oListItem.set_item("OtherVehicleMake", vehmaketxt);
    oListItem.set_item("OtherProductType", prodtypetxt);
    oListItem.set_item("OtherCustomerComplaint", customercmplnttxt);
    oListItem.set_item("Status", "Saved");
    var assignedToCSMVal = new SP.FieldUserValue();
    assignedToCSMVal.set_lookupId(tsmcsm[0]);   //specify User Id 
    oListItem.set_item("AssignedToCSME", assignedToCSMVal);
    var assignedToTSMVal = new SP.FieldUserValue();
    assignedToTSMVal.set_lookupId(tsmcsm[1]);   //specify User Id 
    oListItem.set_item("AssignedToTSME", assignedToTSMVal);
    var assignedToBOSCHVal = new SP.FieldUserValue();
    assignedToBOSCHVal.set_lookupId(tsmcsm[2]);   //specify User Id 
    oListItem.set_item("AssignedToBOSCHDealer", assignedToBOSCHVal);


    oListItem.update();
    clientContext.load(oListItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
}
function onQuerySucceeded() {
    var btn = 'saveBtn';
    createImageFolderForJobCard(oListItem.get_id());
    SaveJobCardNo(oListItem.get_id(), btn);
    //startWF=1;
}
function onQueryFailed(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}
function SaveJobCardNo(createdId, clickedBtn) {
    //Getting Data	
    this.ItemId = createdId;
    this.Btn = clickedBtn;
    jobCode = createdId;
    clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle("JOBCardMasterList");
    this.oListItem = oList.getItemById(ItemId);
    oListItem.set_item("JobCode", ItemId);

    var ReviewLink = GetSiteURL() + "/SitePages/ReviewJOBCard.aspx?ItemId=" + ItemId;
    var ReviewUrlValue = new SP.FieldUrlValue();
    ReviewUrlValue.set_url(ReviewLink);
    ReviewUrlValue.set_description("Review");

    oListItem.set_item("ReviewLink", ReviewUrlValue);

    var EditLink;
    if (clickedBtn == 'saveBtn') {
        EditLink = GetSiteURL() + "/SitePages/EditJOBCard.aspx?ItemId=" + ItemId;
    }
    else {
        EditLink = GetSiteURL() + "/SitePages/ReviewJOBCard.aspx?ItemId=" + ItemId;
    }

    var EditUrlValue = new SP.FieldUrlValue();
    EditUrlValue.set_url(EditLink);
    EditUrlValue.set_description("Edit");
    oListItem.set_item("EditLink", EditUrlValue);

    var ProductPhotoLink = GetSiteURL() + "/JobCardImages/" + ItemId;
    var ProductPhotoLinkUrlValue = new SP.FieldUrlValue();
    ProductPhotoLinkUrlValue.set_url(ProductPhotoLink);
    ProductPhotoLinkUrlValue.set_description("Image");
    oListItem.set_item("ProductPhotoLink", ProductPhotoLinkUrlValue);

    var ViewLink = GetSiteURL() + "/SitePages/EditJOBCard.aspx?ItemId=" + ItemId;
    var ViewUrlValue = new SP.FieldUrlValue();
    ViewUrlValue.set_url(ViewLink);
    ViewUrlValue.set_description("View");
    oListItem.set_item("ViewLink", ViewUrlValue);

    oListItem.update();
    clientContext.load(oListItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onDataSaved), Function.createDelegate(this, this.onDataNotSaved));
}
function onDataSaved() {

    SaveJobCardNoAsTitle(oListItem.get_id(), this.Btn);
    console.log('Job Code Created : ' + oListItem.get_item('Title'));
    alert('Job Code Created : ' + oListItem.get_item('Title'));
    //oListItem.get_item('JobCardNo')
    //ClearFields();
    //window.location.replace(_spPageContextInfo.webAbsoluteUrl);
    //var redirectPageUrl = _spPageContextInfo.webAbsoluteUrl;
    var redirectPageUrl = GetSiteURL();
    if (this.Btn != "submitBtn") {
        var redirectPageUrl = redirectPageUrl + '/SitePages/EditJobCard.aspx?ItemId=' + this.ItemId;
    }
    window.location.replace(redirectPageUrl);

}
function onDataNotSaved(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function SaveJobCardNoAsTitle(createdId, btn) {
    //Getting Data	
    this.clickedBtn = btn;
    clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle("JOBCardMasterList");
    this.oListItem = oList.getItemById(createdId);
    oListItem.set_item("Title", (parseInt(createdId)).pad(6));
    oListItem.update();
    clientContext.load(oListItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onDataSavedTitle), Function.createDelegate(this, this.onDataNotSavedTitle));
}

//pad() for JobCard column
Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

function onDataSavedTitle() {
    console.log('Job Code Created : ' + oListItem.get_item('JobCardNo'));
    //ClearFields();
    //window.location.replace(_spPageContextInfo.webAbsoluteUrl);
    //var redirectPageUrl = _spPageContextInfo.webAbsoluteUrl;
    var redirectPageUrl = GetSiteURL();
    if (this.clickedBtn != "submitBtn") {
        var redirectPageUrl = redirectPageUrl + '/SitePages/EditJobCard.aspx?ItemId=' + this.ItemId;
    }
    window.location.replace(redirectPageUrl);

}
function onDataNotSavedTitle(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

function GetReferenceNumber() {
    // var temp=GetJOBCode();
    var d = new Date();
    var year = "" + d.getFullYear();



    var NewJobCodeUrl = GetSiteURL();
    //"/_api/web/lists/getByTitle('JOBCardMasterList')/items?$top=1&$orderby=Created desc";
    NewJobCodeUrl = NewJobCodeUrl + "/_vti_bin/ListData.svc/JOBCardMasterList?$top=1&$orderby=Created desc";

    var newJobCard;
    $.ajax({

        url: NewJobCodeUrl,
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (data) {
            $.each(data.d, function (index, item) {
                newJobCard = (Number(item.JobCode) + 1);


            });
            if (!(newJobCard != undefined || newJobCard != 'undefined')) {
                ReferenceNumber = $.now() + "" + newJobCard;

            }
            else {
                ReferenceNumber = $.now() + "" + 0;
            }
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }

    });


    //  ReferenceNumber = $.now();

}
function ClearFields() {

    //$("#txtServicePartnerCode").val("");
    $("#ddlProductType").prop('selectedIndex', 0);
    //$("#txtJobCode").val("");
    GetReferenceNumber();
    $("#txtReportDate").val("");
    $("#txtSaleDate").val("");
    $("#txtRepairEndDate").val("");
    $("#txtComplaintDate").val("");
    $("#txtAreaCustomerDetails").val("");
    $("#txtAreaOECDNameAndAddress").val("");
    $("#txtCustomerCity").val("");
    $("#txtOECDCity").val("");
    $("#txtCustomerPhoneNumber").val("");
    $("#txtOECDPhoneNumber").val("");
    //$("#txtAreaServiceCentreAddress").val("");
    $("#ddlServiceCenterCity").prop('selectedIndex', 0);
    $("#ddlState").prop('selectedIndex', 0);
    $("#ddlServiceCenterName").prop('selectedIndex', 0);
    $("#txtAreaServiceCentreAddress").val("");
    $("#txtVehicleModel").val("");
    $("#txtVehicleRegNo").val("");
    $("#txtEngineNumber").val("");
    $("#txtVINChassisNumber").val("");
    $("#txtKMSCovered").val("");
    //$("#txtEntryDate").val("");
    $("#ddlVehicleType").prop('selectedIndex', 0);
    $("#ddlVehicleMake").prop('selectedIndex', 0);
    $("#ddlCustomerComplaint").prop('selectedIndex', 0);
    $("#ddlMilage").prop('selectedIndex', 0);
    $("#ddlReportTime").prop('selectedIndex', 0);
    $("#ddlSaleTime").prop('selectedIndex', 0);
    $("#ddlRepairTime").prop('selectedIndex', 0);
    $("#ddlComplaintTime").prop('selectedIndex', 0);
    $("#txtAreaCustomerComplaintDesc").val("");
    $("input:radio[name=isWarranty]").prop('checked', false);
    $("#txtAuxiliaryFormNo").val("");
    $("#txtHrsCovered").val("");
    $("#txtProductPartNumber").val("");
    $("#fileUpload").val("");
    $("#image-holder").children().remove();
}
function SubmitData(jobCode) {

    var radioisWarranty = $('input:radio[name=isWarranty]:checked').val();
    //var ServicePartnerCode = $("#txtServicePartnerCode").val();

    var ProductType = Number($("#ddlProductType").val());
    var selectedProduct = $("#ddlProductType option:selected").text();
    if (selectedProduct == 'Others') {
        prodtypetxt = $('#txtddlProductType').val();
    }

    //All Time Fields
    var ReportTime = $("#ddlReportTime option:selected").text();//.replace(/am+$/, ''); 
    var SaleTime = $("#ddlSaleTime option:selected").text();//.replace(/am+$/, ''); 
    var ComplaintTime = $("#ddlComplaintTime option:selected").text();//.replace(/am+$/, ''); 
    var RepairTime = $("#ddlRepairTime option:selected").text();//.replace(/am+$/, '');		
    //All Date
    var ReportDate = convertDate($("#txtReportDate").val(), ReportTime);
    var SaleDate = convertDate($("#txtSaleDate").val(), SaleTime);
    var RepairEndDate = convertDate($("#txtRepairEndDate").val(), ComplaintTime);
    var ComplaintDate = convertDate($("#txtComplaintDate").val(), RepairTime);
    var EntryDate = convertDate($("#txtEntryDate").val());
    if ($("#txtAuxiliaryFormNo").val() != null) {
        AuxiliaryFormNo = $("#txtAuxiliaryFormNo").val();
        OECDNameAndAddress = removeJunkChar('txtAreaOECDNameAndAddress');
        OECDCity = $("#txtOECDCity").val();
        OECDPhoneNumber = $("#txtOECDPhoneNumber").val();
    }
    //Customer Details
    var CustomerDetails = removeJunkChar('txtAreaCustomerDetails');
    var CustomerCity = $("#txtCustomerCity").val();
    var CustomerPhoneNumber = $("#txtCustomerPhoneNumber").val();
    //Customer Complaint
    var CustomerComplaint = $("#ddlCustomerComplaint").val();
    if ($("#ddlCustomerComplaint").text() == 'Others') {
        customercmplnttxt = $('#txtddlCustomerComplaint').val();
    }
    var CustomerComplaintDesc = removeJunkChar('txtAreaCustomerComplaintDesc');
    //BOSCH Service Centre Details
    var State = Number($("#ddlState").val());
    var ServiceCenterCity = Number($("#ddlServiceCenterCity").val());
    var ServiceCenterName = Number($("#ddlServiceCenterName").val());
    var ServiceCentreAddress = removeJunkChar('txtAreaServiceCentreAddress');
    //Vehicle Details			
    var VehicleType = Number($('#ddlVehicleType').val());
    if ($('#ddlVehicleType option:selected').text() == 'Others') {
        vehtyptxt = $('#txtddlVehicleType').val();
    }
    var VehicleMake = Number($("#ddlVehicleMake").val());
    if ($("#ddlVehicleMake option:selected").text() == 'Others') {
        vehmaketxt = $('#txtddlVehicleMake').val();
    }
    var VehicleModel = $("#txtVehicleModel").val();
    var VehicleRegNo = $("#txtVehicleRegNo").val();
    var EngineNumber = $("#txtEngineNumber").val();
    var VINChassisNumber = $("#txtVINChassisNumber").val();
    var KMSCovered = $("#txtKMSCovered").val();
    var HrsCovered = $("#txtHrsCovered").val();
    var KmsOrHrs = Number($("#ddlMilage").val());
	
	//var GroupOfUser = UserGroupCheck();
	
	 var siteURL = GetSiteURL();
   	 var CurrentUserName = $().SPServices.SPGetCurrentUser({
	webURL: siteURL,
	fieldName: "Name",

	debug: false
	});
	var AvailGroups = ["TML", "VECV", "CNH", "SMLI","FML"];
   // var GroupsPresent = [];
        $().SPServices({

	     webURL: siteURL,
            operation: "GetGroupCollectionFromUser",

            userLoginName: CurrentUserName,

            async: false,

            completefunc: function (xData, Status) {

                for (var i = 0; i < AvailGroups.length; i++) {
                    if ($(xData.responseXML).find("Group[Name='" + AvailGroups[i] + "']").length == 1) {
                        GroupsPresent.push(AvailGroups[i]);

                    }
                }
			}
		});			
				var groups = GroupsPresent[0]
				
				var userGroup = '';
    var context = new SP.ClientContext.get_current();
    this.currentUser = context.get_web().get_currentUser();
    CurrentUserID = _spPageContextInfo.userId;
   
			for(var i = 0 ; i < groups.length ; i++)
			{
				userGroup = userGroup.concat(groups[i]);
				
				
			}
	
	var GroupOfUser = userGroup;
	
	var context = new SP.ClientContext.get_current();
this.website = context.get_web();
this.currentUser = website.get_currentUser(); 
	
    clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle("JOBCardMasterList");
    if (!((jobCode == 'undefined') || (jobCode == undefined)))
    { this.oListItem = oList.getItemById(jobCode); }
    else {
        var itemCreateInfo = new SP.ListItemCreationInformation();
        this.oListItem = oList.addItem(itemCreateInfo);
        var CurrentReferenceNumber = ReferenceNumber;
        oListItem.set_item("Title", CurrentReferenceNumber);
    }
    //Adding Data       

    oListItem.set_item("isWarranty", radioisWarranty);
    oListItem.set_item("ProductType", ProductType);
    //Date
    if (ReportDate != null) {
        oListItem.set_item("ReportDate", ReportDate);
    }
    if (SaleDate != null) {
        oListItem.set_item("SaleDate", SaleDate);
    }
    if (RepairEndDate != null) {
        oListItem.set_item("RepairEndDate", RepairEndDate);
    }
    oListItem.set_item("ComplaintDate", ComplaintDate);
    oListItem.set_item("EntryDate", EntryDate);
    //Time

    //OECD Details
    oListItem.set_item("AuxiliaryFormNo", AuxiliaryFormNo);
    oListItem.set_item("OECDNameAndAddress", OECDNameAndAddress);
    oListItem.set_item("OECDCity", OECDCity);
    oListItem.set_item("OECDPhoneNumber", OECDPhoneNumber);
    //Customer Details			
    oListItem.set_item("CustomerDetails", CustomerDetails);
    oListItem.set_item("CustomerCity", CustomerCity);
    oListItem.set_item("CustomerPhoneNumber", CustomerPhoneNumber);
    oListItem.set_item("CustomerComplaint", CustomerComplaint);
    oListItem.set_item("CustomerComplaintDesc", CustomerComplaintDesc);
    //BOSCH Service Centre
    oListItem.set_item("State", State);
    oListItem.set_item("ServiceCenterCity", ServiceCenterCity);
    oListItem.set_item("ServiceCenterName", ServiceCenterName);
    oListItem.set_item("ServiceCentreAddress", ServiceCentreAddress);
    //Vehicle Details
    oListItem.set_item("VehicleType", VehicleType);
    oListItem.set_item("VehicleMake", VehicleMake);
    oListItem.set_item("VehicleModel", VehicleModel);
    oListItem.set_item("VehicleRegNo", VehicleRegNo);
    oListItem.set_item("EngineNumber", EngineNumber);
    oListItem.set_item("VINChassisNumber", VINChassisNumber);
    oListItem.set_item("KMSCovered", KMSCovered);
    oListItem.set_item("HrsCovered", HrsCovered);
	oListItem.set_item("OEMGroup", GroupOfUser);

    //If any other option selected			
    oListItem.set_item("OtherVehicleType", vehtyptxt);
    oListItem.set_item("OtherVehicleMake", vehmaketxt);
    oListItem.set_item("OtherProductType", prodtypetxt);
    oListItem.set_item("OtherCustomerComplaint", customercmplnttxt);
    oListItem.set_item("Status", 'Submitted');
    var assignedToCSMVal = new SP.FieldUserValue();
    assignedToCSMVal.set_lookupId(tsmcsm[0]);   //specify User Id 
    oListItem.set_item("AssignedToCSME", assignedToCSMVal);
    var assignedToTSMVal = new SP.FieldUserValue();
    assignedToTSMVal.set_lookupId(tsmcsm[1]);   //specify User Id 
    oListItem.set_item("AssignedToTSME", assignedToTSMVal);
    var assignedToBOSCHVal = new SP.FieldUserValue();
    assignedToBOSCHVal.set_lookupId(tsmcsm[2]);   //specify User Id 
    oListItem.set_item("AssignedToBOSCHDealer", assignedToBOSCHVal);



    oListItem.update();
    //clientContext.load(oListItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.DataSubmitted), Function.createDelegate(this, this.DataNotSubmitted));

}

function createImageFolderForJobCard(folderName) {
    var folderExists = checkIfJobCardImageFolderExists(folderName);
    if (!folderExists) {
        var folderPath = "/JobCardImages";
        var folderPayload = {
            "ContentTypeID": "0x0120",
            'ContentType': 'Folder',
            'Title': folderName,
            'Path': folderPath
        };

        $.ajax({
            url: GetSiteURL() + "/_vti_bin/listdata.svc/JobCardImages",
            type: "POST",
            async: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(folderPayload),
            headers: {
                "Accept": "application/json;odata=verbose",
                "Slug": "/Sites/EWJC" + folderPath + "/" + folderName + "|0x0120",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                console.log("Image folder for the job card is created");
            },
            error: function (data) {
                console.log("Failure : " + JSON.stringify(data));
            }
        });
    }
    var url = GetSiteURL() + "/JobCardImages" + "/" + folderName;
    countFiles = $("#fileUpload")[0].files.length;
    if (countFiles > 0) {
        imgPath = $("#fileUpload")[0].value;
        extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
        var image_holder = $("#image-holder");
        if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg" || extn == "pdf" || extn == "doc" || extn == "docx" || extn == "xls" || extn == "xlsx") {
            if (typeof (FileReader) != "undefined") {
                //loop for each file selected for uploaded.
                for (var i = 0; i < countFiles; i++) {
                    setupReader($("#fileUpload")[0].files[i], image_holder, null, url);
                }
            } else {
                alert("This browser does not support FileReader.");
                $('#fileUpload').val('');
            }
        } else {
            alert("Pls select only images/PDF/Doc/Excel Type");
            $('#fileUpload').val('');
        }
    }
}

function setupReader(file, image_holder, index, url) {
    var name = file.name;
    var imgPath = $("#fileUpload")[0].value;
    imgPath = imgPath.substring(0, imgPath.lastIndexOf('\\'));
    var sourcePath = imgPath + '\\' + name;
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = reader.result,
     n = data.indexOf(";base64,") + 8;
        //removing the first part of the dataurl give us the base64 bytes we need to feed to sharepoint
        data = data.substring(n);
        uploadFile(name, data, url, sourcePath);
    }

    // reader.readAsArrayBuffer($(this)[0].files[i]);

    //if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg") { image_holder.show(); }


    reader.readAsDataURL(file);
}

function uploadFile(FileName, FileData, url, sourcePath) {
    url = url + "/" + FileName;
    var soapEnv =
"<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'> \
            <soap:Body>\
                <CopyIntoItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'>\
                    <SourceUrl>sourcePath</SourceUrl>\
                        <DestinationUrls>\
                            <string> "+ url + "</string>\
                        </DestinationUrls>\
                        <Fields>\
                            <FieldInformation Type='Text' DisplayName='Title' InternalName='Title' Value='"+ FileName + "' />\
                        </Fields>\
                    <Stream>"+ FileData + "</Stream>\
                </CopyIntoItems>\
            </soap:Body>\
        </soap:Envelope>";

	var siteURL = GetSiteURL();
    jQuery.ajax({

	
        url: siteURL + "/_vti_bin/copy.asmx",
        beforeSend: function (xhr) { xhr.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems"); },
        type: "POST",
        dataType: "xml",
        data: soapEnv,
        contentType: "text/xml; charset=\"utf-8\""
    });
}
function UserGroupCheck() {


var AvailGroups = ["TML", "VECV", "CNH", "SMLI","FML"];
   // var GroupsPresent = [];
	 var siteURL = GetSiteURL();
    var CurrentUserName = $().SPServices.SPGetCurrentUser({
	webURL: siteURL,
	fieldName: "Name",

	debug: false
	});

        $().SPServices({

	    webURL: siteURL,
            operation: "GetGroupCollectionFromUser",

            userLoginName: CurrentUserName,

            async: false,

            completefunc: function (xData, Status) {

                for (var i = 0; i < AvailGroups.length; i++) {
                    if ($(xData.responseXML).find("Group[Name='" + AvailGroups[i] + "']").length == 1) {
                        GroupsPresent.push(AvailGroups[i]);

                    }
                }
	//var x = IsMemberInTheGroup(GroupsPresent);	
        //return x;
		return IsMemberInTheGroup(GroupsPresent[0]);
	 
   }
});

}



function IsMemberInTheGroup(GroupsPresent) {

var userGroup = '';
    var context = new SP.ClientContext.get_current();
    this.currentUser = context.get_web().get_currentUser();
    CurrentUserID = _spPageContextInfo.userId;
   
			for(var i = 0 ; i < GroupsPresent.length ; i++)
			{
				userGroup = userGroup.concat(GroupsPresent[i]);
				
				
			}
			return userGroup;
}
function checkIfJobCardImageFolderExists(folderName) {
    var folderExists = false;
    $.ajax({
        url: GetSiteURL() + "/_vti_bin/listdata.svc/JobCardImages?$filter=(Name eq '" + folderName + "')",
        type: "GET",
        async: false,
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            if (data.d.results.length > 0) {
                folderExists = true;
                console.log("Image folder for the job card already exists");
            }
            else {
                folderExists = false;
            }
        },
        error: function (data) {
            console.log(data.responseJSON.error);
        }
    });

    return folderExists;
}

function DataSubmitted() {
    var btn = 'submitBtn';
    createImageFolderForJobCard(oListItem.get_id());
    if (((jobCode == 'undefined') || (jobCode == undefined))) {
        SaveJobCardNo(oListItem.get_id(), btn);
    }
    alert('JobCard Submitted for Review..');
    //window.location.href = GetSiteURL() + "/SitePages/OEDealerHomePage.aspx";
}
function DataNotSubmitted(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

document.onreadystatechange = function () {
    var state = document.readyState
    if (state == 'interactive') {
        document.getElementById('NewJobCardDiv').style.visibility = "hidden";
    } else if (state == 'complete') {
        setTimeout(function () {
            document.getElementById('interactive');
            document.getElementById('load').style.visibility = "hidden";
            document.getElementById('NewJobCardDiv').style.visibility = "visible";
        }, 1000);
    }
}