import { nip19 } from "nostr-tools";
import React from "react";
import { FiTrash2 } from "react-icons/fi";
import Button from "src/Components/Button/Button";
import Card from "src/Components/Card/Card";
import {
  MyNostrSettingsQuery,
  useSetUserNostrKeyAsPrimaryMutation,
  useUnlinkNostrKeyMutation,
} from "src/graphql";
import { openModal } from "src/redux/features/modals.slice";
import { useAppDispatch } from "src/utils/hooks";
import CopyToClipboard from "src/Components/CopyToClipboard/CopyToClipboard";
import { extractErrorMessage } from "src/utils/helperFunctions";
import { NotificationsService } from "src/services";
import { useMetaData } from "src/lib/nostr";
import Avatar from "src/features/Profiles/Components/Avatar/Avatar";
import { getProfileDataFromMetaData } from "src/lib/nostr/helpers";
import Badge from "src/Components/Badge/Badge";

interface Props {
  keys: NonNullable<MyNostrSettingsQuery["me"]>["nostr_keys"];
}

export default function LinkedNostrKeys({ keys }: Props) {
  const { metadata } = useMetaData({ pubkeys: keys.map((k) => k.key) });

  const dispatch = useAppDispatch();

  const [unlinkMutate] = useUnlinkNostrKeyMutation();
  const [setKeyPrimaryMutate] = useSetUserNostrKeyAsPrimaryMutation();

  const handleDeleteConnection = (key: string) => {
    if (
      window.confirm(
        "Are you sure you want to unlink this nostr key from your profile?"
      )
    ) {
      unlinkMutate({
        variables: { key },
        onCompleted: () => {
          NotificationsService.success("Key Unlinked Successfully");
        },
      }).catch((err) => {
        const msg = extractErrorMessage(err);
        NotificationsService.error(msg ?? "Something wrong happened...");
      });
    }
  };

  const handleSetKeyPrimary = (key: string) => {
    setKeyPrimaryMutate({
      variables: { key },
      onCompleted: () => {
        NotificationsService.success("Updated primary key");
      },
    }).catch((err) => {
      const msg = extractErrorMessage(err);
      NotificationsService.error(msg ?? "Something wrong happened...");
    });
  };

  return (
    <Card>
      <p className="text-body2 font-bold">🔑 My Linked Nostr Keys </p>
      <p className="mt-8 text-body4 text-gray-600">
        From here, you can add your various nostr public keys to your bolt.fun
        profile.
      </p>
      <p className="mt-16 text-body4 text-gray-600">
        Your <span className="font-bold">primary key</span> will be the one
        that:
      </p>
      <ul className="list-disc list-inside mt-8 text-body4 text-gray-600 flex flex-col gap-4">
        <li>Appears on your public profile page</li>
        <li>People should use to DM you</li>
        <li>People should use to follow you</li>
        <li>Bolt.fun will use to send you important notifications</li>
      </ul>

      <p className="text-body4 text-black font-bold mt-24 mb-12">
        Currently linked pubkeys:
      </p>
      {keys.length > 0 ? (
        <ul className="flex flex-col gap-12">
          {[...keys]
            .sort((k1, k2) => (k1.is_primary ? -1 : 1))
            .map((nostrKey) => {
              const nostrProfile = getProfileDataFromMetaData(
                metadata,
                nostrKey.key
              );
              return (
                <li
                  key={nostrKey.key}
                  className="bg-gray-100 rounded p-16 flex flex-col gap-12"
                >
                  <div className="flex basis-full gap-8 items-center min-w-0">
                    <Avatar width={32} src={nostrProfile.image} />
                    <div className="overflow-hidden">
                      <p className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                        {nostrKey.is_primary && (
                          <Badge color="primary" size="sm" className="mr-8">
                            Primary Key
                          </Badge>
                        )}
                        {nostrProfile.name}
                      </p>
                      <p className="text-gray-500 overflow-hidden text-ellipsis">
                        {nip19.npubEncode(nostrKey.key)}
                      </p>
                    </div>
                    <span className="relative">
                      <CopyToClipboard
                        text={nip19.npubEncode(nostrKey.key)}
                        successMsg="Copied Public Key!"
                      />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-12 justify-end">
                    {" "}
                    {!nostrKey.is_primary && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() => handleSetKeyPrimary(nostrKey.key)}
                        data-tooltip-id="delete-connection"
                        data-tooltip-content="Unlink this nostr key from your profile"
                      >
                        Set as Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      color="red"
                      variant="outline"
                      onClick={() => handleDeleteConnection(nostrKey.key)}
                    >
                      <span className="align-middle mr-8" aria-hidden>
                        Unlink Key
                      </span>
                      <FiTrash2 aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
        </ul>
      ) : (
        <p className="text-gray-500">
          You haven't linked any nostr keys to this profile yet...
        </p>
      )}
      <Button
        fullWidth
        className="mt-24"
        onClick={() =>
          dispatch(openModal({ Modal: "ConnectNostrIdToProfileModal" }))
        }
      >
        🔌 Link a New Nostr Key to Profile
      </Button>
    </Card>
  );
}
