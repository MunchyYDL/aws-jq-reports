  def unmarshal:
    if type == "object" then
      if has("S") then . = .S
      elif has("L") then . = .L
      elif has("M") then . = .M
      else . end
    else . end;

  def nonull:
    map(.owners |= if . == null then [] else . end);

  def init:
    [ .Items[] | walk(unmarshal) ] | nonull;

  def split:
      map(.active = (.owners | map(select(.unregisteredTimestamp == null))))
    | map(.inactive = (.owners | map(select(.unregisteredTimestamp != null))));

  def active:
    map(.owners |= (map(select(.unregisteredTimestamp == null))));

  def owners_eq($n):
    map(select(.owners | length == $n ));

  def owners_gt($n):
    map(select(.owners | length > $n ));

  def owners_gte($n):
    map(select(.owners | length >= $n ));

  def grouped:
    [ .[] | .owners | length ] 
    | group_by(.)
    | map({ ((first | tostring) + "_owners"): (. | length) })
    | add;

  def proj_owner:
    { 
      sfid: .id,
      ownerType: .information.ownerType, 
      psid: .information?.polestarId,
      registeredAt: .registeredAt,
      unregisteredAt: .unregisteredTimestamp
    };

  def proj_details:
    map({
      vin: .vin, 
      owners: (.owners | map(proj_owner) | sort_by(.registeredAt))
    })
    | sort_by(.vin);

  def proj_vin_array:
    [.[] | .vin ] | sort;
