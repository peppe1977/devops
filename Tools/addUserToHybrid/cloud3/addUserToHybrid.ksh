#!/bin/ksh

## Script to provision users into Apcera Platform Cluster
## Dev is provisioned with a private namespace (and isolation)
## 
##
## 
## To-Do: 1. create templates multi-tenants (project common namespace) and adapt script
##           in order to have 2 options. Dev with only private ns and dev with private and
##           project ns.

function dieUsage
{
	echo "$*"
	echo "addUserToHybrid.ksh -e email -n username"
	exit 9
}

function checkPolicy
{
	policy="$1"
	
	apc policy show "$policy" > /dev/null 2>&1
	if [ $? -eq 0 ]
	then
		dieUsage "Error, policy $policy already exists"	
	fi
}

function fixFile
{
	sourceFile=$1
	destFile=$2
	
	cp $sourceFile $destFile
	
	sed -i.zz "s|%CLUSTER%|$CLUSTER|g" $destFile
	sed -i.zz "s|%EMAIL%|$EMAIL|g" $destFile
	sed -i.zz "s|%USER_HYPHEN%|$USER_HYPHEN|g" $destFile
	sed -i.zz "s|%USER_NAME%|$USER_NAME|g" $destFile
	sed -i.zz "s|%USER_SLASH_ROUTE%|$USER_SLASH_ROUTE|g" $destFile
	sed -i.zz "s|%MEMORY%|$MEMORY|g" $destFile
	
	rm $destFile.zz
}


typeset -l EMAIL=""
typeset -l USER_NAME=""
INSTALL_DEMO=false
#HYBRID_CLUSTER="http://cloud3.ericsson-magic.net" #Apcera on vSphere/ESXi (Santa Clara)
HYBRID_CLUSTER="http://cloud.explab.net" #Apcera on Geo-Dist (Plano/Santa Clara) Hybrid Bare/vSphere
#APP_NAME=workloadmobility

typeset -u MEMORY=2GB

while getopts "de:fm:n:" option
do
    case $option in
	d)
		INSTALL_DEMO=true
	    ;;
	e)
		EMAIL=$OPTARG
	    ;;
	f)
	    FORCE=true
	    ;;
	m)
		MEMORY=$OPTARG
		;;
	n)
		# Make sure we use the dotted version.
		#
		USER_NAME=$(echo $OPTARG | tr "-" ".")
		;;
	*)
		dieUsage invalid option $option
		;;
    esac
done

shift `expr $OPTIND - 1`

echo "ADDING $USER_NAME with email $EMAIL to cluster"
CLUSTER=$(echo $HYBRID_CLUSTER | cut -d/ -f 3)

# Make sure that we are on the right cluster
#
SAVE_CLUSTER=$(apc target| grep Targeted| cut -d/ -f 3 |cut -d] -f 1)
if [ $SAVE_CLUSTER != $HYBRID_CLUSTER ] 
then 
	echo "WARNING, switching to use this on e/// hybrid $HYBRID_CLUSTER"
	apc target $HYBRID_CLUSTER
fi

[ -z "$EMAIL" ] && dieUsage "Email is required"
[ -z "$USER_NAME" ] && dieUsage "User Name is required"


USER_HYPHEN=$(echo $USER_NAME | tr "." "-")
userAuth=user-$USER_HYPHEN
userPolicy=user-policy-$USER_HYPHEN

USER_SLASH_ROUTE=""
NAMEARRAY=(${USER_NAME//./ })
for ((i=${#NAMEARRAY[@]}-1; i>=0; i--))
do
    [ -n "$USER_SLASH_ROUTE" ] && USER_SLASH_ROUTE="${USER_SLASH_ROUTE}/"
    USER_SLASH_ROUTE="${USER_SLASH_ROUTE}${NAMEARRAY[$i]}"
done

if [ "$FORCE" = true ]
then
    apc policy delete $userAuth --batch
    apc policy delete $userPolicy --batch
fi

checkPolicy $userAuth
checkPolicy $userPolicy

fixFile user.pol.template        $userAuth.pol
fixFile user-policy.pol.template $userPolicy.pol

apc policy import $userAuth.pol --batch
apc policy import $userPolicy.pol --batch

rm $userAuth.pol
rm $userPolicy.pol

#if [ $INSTALL_DEMO = true ]
#then
#	echo "INSTALL DEMO!"
#	
#	WM_DIR=../../tpm/workload-mobility
#
#	[ -d ${WM_DIR} ] || (echo "$WM_DIR does not exist" && exit 9)
#
#	cd ${WM_DIR}
#	
#	./install-for-user.ksh -a aws -g google -x /sandbox/$USER_NAME -n $APP_NAME
#	
#	cd -
#fi
#echo "$SAVE_CLUSTER"
#apc target $SAVE_CLUSTER

open "mailto:$EMAIL?subject=($USER_NAME) You have been added to the ${CLUSTER} cluster"


cat << EOF

EMAIL THIS:

================================================================================


You have been added to the $CLUSTER with a memory quota of ${MEMORY}.
You will be using google authentication to log on to the system.  The email 
address that you provided [$EMAIL] is your login.

Your default namespace is [/sandbox/$USER_NAME]

You can log on to the cluster using by visiting [http://console.${CLUSTER}]
in your web browser.  If you wish to use the APC command line tool, download 
it from the cluster if you do not have it already, then run

	apc target http://${CLUSTER}

You are permitted to add routes to your applications, however they must end
with:
	${USER_NAME}.sandbox.${CLUSTER}
	
for example:

	myapp.${USER_NAME}.sandbox.${CLUSTER}

Your memory quota is set to ${MEMORY}

If you are new to Apcera Platform, please check the tutorial below out:

http://developer.apcera.com/tutorials/getting-started/install-virtualbox/

you can find the same URL via console/help.

EOF

if [ $INSTALL_DEMO = true ]
then
	demo_route=$(apc app show /sandbox/${USER_NAME}::$APP_NAME  | grep Routes: | awk '{print $4}')
cat << EOF
	
You also have the Workload Mobility demo installed.  This can be found here:

	$demo_route

I have attached a pdf with instructions to run this.  Let me know if you have any problems.
EOF
fi

